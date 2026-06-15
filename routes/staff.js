const express = require("express");
const router = express.Router();

const requireStaff = require("../middleware/requireStaff");

const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Models đang dùng trong luồng hiện tại
const Order = require("../models/Order");
const Product = require("../models/Product");
const BookingSpace = require("../models/BookingSpace");
const User = require("../models/User");

// =========================
// Helpers: product upload
// =========================

function getProductTypeFromUrl(req) {
  if (req.originalUrl.includes("/books")) return "book";
  if (req.originalUrl.includes("/drinks")) return "drink";
  if (req.originalUrl.includes("/snacks")) return "snack";
  return "drink";
}

function getImageFolderByType(type) {
  if (type === "book") return "Books";
  if (type === "snack") return "Snacks";
  return "Drinks";
}

function makeSlug(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeProductStatus(status, stock) {
  const numericStock = Number(stock) || 0;

  if (status === "hidden") return "hidden";
  if (status === "out_of_stock" || status === "unavailable") return "out_of_stock";
  if (numericStock <= 0) return "out_of_stock";

  return "available";
}

const productImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = getProductTypeFromUrl(req);
    const folder = getImageFolderByType(type);

    const backendDir = process.env.CUSTOMER_BACKEND_DIR;

    if (!backendDir) {
      return cb(new Error("Thiếu CUSTOMER_BACKEND_DIR trong .env"));
    }

    const uploadDir = path.join(backendDir, "data", "image", folder);

    fs.mkdirSync(uploadDir, { recursive: true });

    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    const safeName = makeSlug(baseName) || "product";
    const uniqueName = `${Date.now()}-${safeName}${ext}`;

    cb(null, uniqueName);
  }
});

const uploadProductImage = multer({
  storage: productImageStorage,
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ được upload file ảnh"));
    }

    cb(null, true);
  }
});

function getProductImageUrl(req) {
  if (!req.file) return "";

  const type = getProductTypeFromUrl(req);
  const folder = getImageFolderByType(type);

  return `/images/${folder}/${req.file.filename}`;
}

// =========================
// Helpers: loyalty points
// =========================

function calculateEarnedPoints(amount) {
  return Math.floor(Number(amount || 0) / 10000);
}

function calculateMembershipLevel(points) {
  const totalPoints = Number(points || 0);

  if (totalPoints >= 600) return "Kim cương";
  if (totalPoints >= 300) return "Vàng";
  if (totalPoints >= 100) return "Bạc";

  return "Đồng";
}

async function addLoyaltyPointsToUser(user, amount) {
  if (!user) return null;

  const earnedPoints = calculateEarnedPoints(amount);

  if (earnedPoints <= 0) return null;

  const newPoints = Number(user.points || 0) + earnedPoints;
  const newMembershipLevel = calculateMembershipLevel(newPoints);

  user.points = newPoints;
  user.membershipLevel = newMembershipLevel;
  user.isLoyalMember = true;

  await user.save();

  return {
    userId: user._id,
    earnedPoints,
    points: user.points,
    membershipLevel: user.membershipLevel
  };
}

async function findUserForBooking(booking) {
  if (booking.customerId) {
    const userById = await User.findById(booking.customerId);

    if (userById) return userById;
  }

  if (booking.phone) {
    const userByPhone = await User.findOne({
      phone: booking.phone,
      role: "customer"
    });

    if (userByPhone) return userByPhone;
  }

  return null;
}

async function findUserForOrder(phone) {
  if (!phone) return null;

  const user = await User.findOne({
    phone,
    role: "customer"
  });

  return user;
}

async function deductStockForItems(items) {
  if (!items || items.length === 0) return;

  for (const item of items) {
    if (!item.productId) continue;

    const quantity = Number(item.quantity || 0);

    if (quantity <= 0) continue;

    const product = await Product.findById(item.productId);

    if (!product) continue;

    const currentStock = Number(product.stock || 0);
    const newStock = Math.max(currentStock - quantity, 0);

    const updateData = {
      stock: newStock
    };

    if (newStock <= 0) {
      updateData.status = "out_of_stock";
    }

    await Product.findByIdAndUpdate(product._id, updateData);
  }
}

async function deductStockForOrder(order) {
  if (!order || !order.items || order.items.length === 0) {
    return;
  }

  for (const item of order.items) {
    if (!item.productId) continue;

    const quantity = Number(item.quantity || 0);

    if (quantity <= 0) continue;

    const product = await Product.findById(item.productId);

    if (!product) continue;

    const currentStock = Number(product.stock || 0);
    const newStock = Math.max(currentStock - quantity, 0);

    const updateData = {
      stock: newStock
    };

    if (newStock <= 0) {
      updateData.status = "out_of_stock";
    }

    await Product.findByIdAndUpdate(product._id, updateData);
  }
}

// Protect all staff routes
router.use(requireStaff);

// =========================
// DASHBOARD
// =========================

router.get("/", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      pendingOrders,
      ordersToday,
      pendingBookings,
      bookStockResult,
      drinkStockResult,
      snackStockResult
    ] = await Promise.all([
      Order.countDocuments({
        status: "pending"
      }),

      Order.countDocuments({
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      }),

      BookingSpace.countDocuments({
        status: "pending"
      }),

      Product.aggregate([
        {
          $match: {
            type: "book",
            isActive: true,
            status: { $ne: "hidden" }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$stock" }
          }
        }
      ]),

      Product.aggregate([
        {
          $match: {
            type: "drink",
            isActive: true,
            status: { $ne: "hidden" }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$stock" }
          }
        }
      ]),

      Product.aggregate([
        {
          $match: {
            type: "snack",
            isActive: true,
            status: { $ne: "hidden" }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$stock" }
          }
        }
      ])
    ]);

    res.render("staff/dashboard", {
      pendingOrders,
      ordersToday,
      pendingBookings,
      bookStock: bookStockResult[0]?.total || 0,
      drinkStock: drinkStockResult[0]?.total || 0,
      snackStock: snackStockResult[0]?.total || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// =========================
// PRODUCTS - BOOKS
// =========================

router.get("/books", async (req, res) => {
  try {
    const books = await Product.find({
      type: "book",
      isActive: true,
      status: { $ne: "hidden" }
    }).sort({ name: 1 });

    res.render("staff/products/books", { books });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get("/books/add", (req, res) => {
  res.render("staff/products/book-form", {
    product: null,
    action: "/staff/books/add"
  });
});

router.post("/books/add", uploadProductImage.single("image"), async (req, res) => {
  try {
    const { name, author, publisher, price, stock, status } = req.body;

    await Product.create({
      name,
      slug: makeSlug(name),
      type: "book",
      category: "Book",
      price: Number(price) || 0,
      imageUrl: getProductImageUrl(req),
      description: "",
      stock: Number(stock) || 0,
      status: normalizeProductStatus(status, stock),
      isBestSeller: false,
      isActive: true,
      author: author || "",
      publisher: publisher || "",
      canReadAtCafe: false,
      canBuy: true
    });

    res.redirect("/staff/books");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get("/books/:id/edit", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).send("Book not found");

    res.render("staff/products/book-form", {
      product,
      action: `/staff/books/${product._id}/edit`
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.post("/books/:id/edit", uploadProductImage.single("image"), async (req, res) => {
  try {
    const { name, author, publisher, price, stock, status } = req.body;

    const updateData = {
      name,
      slug: makeSlug(name),
      category: "Book",
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      status: normalizeProductStatus(status, stock),
      author: author || "",
      publisher: publisher || ""
    };

    const imageUrl = getProductImageUrl(req);

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    await Product.findByIdAndUpdate(req.params.id, updateData);

    res.redirect("/staff/books");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.post("/books/:id/delete", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/staff/books");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// =========================
// PRODUCTS - DRINKS
// =========================

router.get("/drinks", async (req, res) => {
  try {
    const drinks = await Product.find({
      type: "drink",
      isActive: true,
      status: { $ne: "hidden" }
    }).sort({ name: 1 });

    res.render("staff/products/drinks", { drinks });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get("/drinks/add", (req, res) => {
  res.render("staff/products/drink-form", {
    product: null,
    action: "/staff/drinks/add"
  });
});

router.post("/drinks/add", uploadProductImage.single("image"), async (req, res) => {
  try {
    const { name, category, price, stock, status } = req.body;

    await Product.create({
      name,
      slug: makeSlug(name),
      type: "drink",
      category: category || "Drink",
      price: Number(price) || 0,
      imageUrl: getProductImageUrl(req),
      description: "",
      stock: Number(stock) || 0,
      status: normalizeProductStatus(status, stock),
      isBestSeller: false,
      isActive: true,
      author: "",
      publisher: "",
      canReadAtCafe: false,
      canBuy: true
    });

    res.redirect("/staff/drinks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get("/drinks/:id/edit", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).send("Drink not found");

    res.render("staff/products/drink-form", {
      product,
      action: `/staff/drinks/${product._id}/edit`
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.post("/drinks/:id/edit", uploadProductImage.single("image"), async (req, res) => {
  try {
    const { name, category, price, stock, status } = req.body;

    const updateData = {
      name,
      slug: makeSlug(name),
      category: category || "Drink",
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      status: normalizeProductStatus(status, stock)
    };

    const imageUrl = getProductImageUrl(req);

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    await Product.findByIdAndUpdate(req.params.id, updateData);

    res.redirect("/staff/drinks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.post("/drinks/:id/delete", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/staff/drinks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// =========================
// PRODUCTS - SNACKS
// =========================

router.get("/snacks", async (req, res) => {
  try {
    const snacks = await Product.find({
      type: "snack",
      isActive: true,
      status: { $ne: "hidden" }
    }).sort({ name: 1 });

    res.render("staff/products/snacks", { snacks });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get("/snacks/add", (req, res) => {
  res.render("staff/products/snack-form", {
    product: null,
    action: "/staff/snacks/add"
  });
});

router.post("/snacks/add", uploadProductImage.single("image"), async (req, res) => {
  try {
    const { name, price, stock, status } = req.body;

    await Product.create({
      name,
      slug: makeSlug(name),
      type: "snack",
      category: "Snack",
      price: Number(price) || 0,
      imageUrl: getProductImageUrl(req),
      description: "",
      stock: Number(stock) || 0,
      status: normalizeProductStatus(status, stock),
      isBestSeller: false,
      isActive: true,
      author: "",
      publisher: "",
      canReadAtCafe: false,
      canBuy: true
    });

    res.redirect("/staff/snacks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get("/snacks/:id/edit", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).send("Snack not found");

    res.render("staff/products/snack-form", {
      product,
      action: `/staff/snacks/${product._id}/edit`
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.post("/snacks/:id/edit", uploadProductImage.single("image"), async (req, res) => {
  try {
    const { name, price, stock, status } = req.body;

    const updateData = {
      name,
      slug: makeSlug(name),
      category: "Snack",
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      status: normalizeProductStatus(status, stock)
    };

    const imageUrl = getProductImageUrl(req);

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    await Product.findByIdAndUpdate(req.params.id, updateData);

    res.redirect("/staff/snacks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.post("/snacks/:id/delete", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/staff/snacks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// =========================
// ORDERS
// =========================

router.get("/orders", async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.render("staff/orders/list", {
      orders,
      currentStatus: status || "all"
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get("/orders/add", async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      status: { $ne: "hidden" }
    }).sort({ type: 1, name: 1 });

    res.render("staff/orders/order-form", {
      products
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.post("/orders/add", async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      orderType,
      paymentMethod,
      paymentStatus,
      status,
      note
    } = req.body;

    const productIds = [].concat(req.body.product_id || []);
    const productQtys = [].concat(req.body.product_qty || []);

    const items = [];
    let totalAmount = 0;

    for (let i = 0; i < productIds.length; i++) {
      if (!productIds[i]) continue;

      const product = await Product.findById(productIds[i]);
      const quantity = parseInt(productQtys[i]) || 1;

      if (!product || quantity <= 0) continue;

      if (Number(product.stock || 0) < quantity) {
        return res.status(400).send(
          `Sản phẩm "${product.name}" không đủ tồn kho. Hiện còn ${product.stock || 0}.`
        );
      }

      items.push({
        productId: product._id,
        name: product.name,
        type: product.type,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl || ""
      });

      totalAmount += product.price * quantity;
    }

    if (items.length === 0) {
      return res.status(400).send("Vui lòng chọn ít nhất một sản phẩm");
    }

    const loyalUser = await findUserForOrder(phone);

    const finalStatus = status || "pending";
    const isCompleted = finalStatus === "completed";

    const finalPaymentStatus = isCompleted
      ? "paid"
      : paymentStatus || (paymentMethod === "cash" ? "unpaid" : "paid");

    const order = await Order.create({
      customerId: loyalUser ? loyalUser._id : null,
      customerName: loyalUser
        ? loyalUser.fullName || customerName || "Khách hàng thân thiết"
        : customerName || "Khách tại quầy",
      phone: phone || "Không có",
      email: loyalUser ? loyalUser.email || email || "" : email || "",
      items,
      customerType: loyalUser ? "loyal" : "regular",
      totalAmount,
      orderType: orderType || "takeaway",
      paymentMethod: paymentMethod || "cash",
      paymentStatus: finalPaymentStatus,
      status: finalStatus,
      isSeenByStaff: true,
      stockDeducted: false,
      loyaltyPointsAwarded: false,
      earnedPoints: 0,
      note: note || ""
    });

    const updateData = {};

    if (isCompleted) {
      await deductStockForItems(order.items);
      updateData.stockDeducted = true;
      updateData.paymentStatus = "paid";

      if (loyalUser) {
        const loyaltyResult = await addLoyaltyPointsToUser(
          loyalUser,
          order.totalAmount
        );

        if (loyaltyResult) {
          updateData.loyaltyPointsAwarded = true;
          updateData.earnedPoints = loyaltyResult.earnedPoints;
        }
      }
    }

    if (Object.keys(updateData).length > 0) {
      await Order.findByIdAndUpdate(order._id, updateData);
    }

    res.redirect("/staff/orders");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    await Order.findByIdAndUpdate(req.params.id, {
      isSeenByStaff: true
    });

    res.render("staff/orders/detail", {
      order
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.post("/orders/:id/status", async (req, res) => {
  try {
    const newStatus = req.body.status;

    const oldOrder = await Order.findById(req.params.id);

    if (!oldOrder) {
      return res.status(404).send("Order not found");
    }

    const updateData = {
      status: newStatus,
      isSeenByStaff: true
    };

    if (newStatus === "completed") {
      updateData.paymentStatus = "paid";
    }

    // Trừ tồn kho khi đơn được hoàn thành
    // Chỉ trừ 1 lần nhờ stockDeducted
    if (
      newStatus === "completed" &&
      oldOrder.status !== "completed" &&
      oldOrder.stockDeducted !== true
    ) {
      await deductStockForOrder(oldOrder);
      updateData.stockDeducted = true;
    }

    // Cộng điểm khách hàng thân thiết khi đơn hoàn thành
    // Chỉ cộng 1 lần nhờ loyaltyPointsAwarded
    if (
      newStatus === "completed" &&
      oldOrder.status !== "completed" &&
      oldOrder.loyaltyPointsAwarded !== true &&
      oldOrder.customerId
    ) {
      const user = await User.findById(oldOrder.customerId);

      if (user) {
        const loyaltyResult = await addLoyaltyPointsToUser(
          user,
          oldOrder.totalAmount
        );

        if (loyaltyResult) {
          updateData.loyaltyPointsAwarded = true;
          updateData.earnedPoints = loyaltyResult.earnedPoints;
        }
      }
    }

    await Order.findByIdAndUpdate(req.params.id, updateData);

    res.redirect("/staff/orders");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// =========================
// BOOKINGS
// =========================

router.get("/bookings", async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    const bookings = await BookingSpace.find(filter).sort({ createdAt: -1 });

    res.render("staff/bookings/list", {
      bookings,
      currentStatus: status || "all"
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get("/bookings/add", async (req, res) => {
  try {
    const products = await Product.find({
      type: { $in: ["drink", "snack"] },
      isActive: true,
      status: { $ne: "hidden" }
    }).sort({ type: 1, name: 1 });

    res.render("staff/bookings/booking-form", {
      products
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.post("/bookings/add", async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      eventName,
      eventType,
      eventDate,
      eventTime,
      participantCount,
      duration,
      note,
      status
    } = req.body;

    const productIds = [].concat(req.body.product_id || []);
    const productQtys = [].concat(req.body.product_qty || []);

    const selectedMenu = [];
    let menuTotal = 0;

    for (let i = 0; i < productIds.length; i++) {
      if (!productIds[i]) continue;

      const product = await Product.findById(productIds[i]);
      const quantity = parseInt(productQtys[i]) || 1;

      if (!product || quantity <= 0) continue;

      if (Number(product.stock || 0) < quantity) {
        return res.status(400).send(
          `Sản phẩm "${product.name}" không đủ tồn kho. Hiện còn ${product.stock || 0}.`
        );
      }

      selectedMenu.push({
        productId: product._id,
        name: product.name,
        type: product.type,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl || ""
      });

      menuTotal += product.price * quantity;
    }

    const spaceFee = Number(participantCount || 0) * 20000;
    const estimatedTotal = spaceFee + menuTotal;

    const finalStatus = status || "pending";
    const isConfirmed = finalStatus === "confirmed";

    const loyalUser = await findUserForOrder(phone);

    const booking = await BookingSpace.create({
      customerId: loyalUser ? loyalUser._id : null,
      customerName: loyalUser
        ? loyalUser.fullName || customerName || "Khách hàng thân thiết"
        : customerName || "Khách tại quầy",
      phone: phone || "Không có",
      email: loyalUser ? loyalUser.email || email || "" : email || "staff-created@livrecafe.local",
      eventName: eventName || "Đặt chỗ làm việc",
      eventType: eventType || "study",
      eventDate,
      eventTime,
      participantCount: Number(participantCount) || 1,
      duration: duration || "1",
      selectedMenu,
      spaceFee,
      menuTotal,
      estimatedTotal,
      paymentStatus: isConfirmed ? "paid" : "unpaid",
      status: finalStatus,
      isSeenByStaff: true,
      stockDeducted: false,
      loyaltyPointsAwarded: false,
      earnedPoints: 0,
      note: note || ""
    });

    const updateData = {};

    if (isConfirmed) {
      if (selectedMenu.length > 0) {
        await deductStockForItems(booking.selectedMenu);
        updateData.stockDeducted = true;
      }

      updateData.paymentStatus = "paid";

      const user = loyalUser || (await findUserForBooking(booking));

      if (user) {
        const loyaltyResult = await addLoyaltyPointsToUser(
          user,
          booking.estimatedTotal
        );

        if (loyaltyResult) {
          updateData.customerId = loyaltyResult.userId;
          updateData.loyaltyPointsAwarded = true;
          updateData.earnedPoints = loyaltyResult.earnedPoints;
        }
      }
    }

    if (Object.keys(updateData).length > 0) {
      await BookingSpace.findByIdAndUpdate(booking._id, updateData);
    }

    res.redirect("/staff/bookings");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.post("/bookings/:id/status", async (req, res) => {
  try {
    const newStatus = req.body.status;

    const oldBooking = await BookingSpace.findById(req.params.id);

    if (!oldBooking) {
      return res.status(404).send("Booking not found");
    }

    const updateData = {
      status: newStatus,
      isSeenByStaff: true
    };

    if (newStatus === "confirmed") {
      updateData.paymentStatus = "paid";
    }

    if (
      newStatus === "confirmed" &&
      oldBooking.status !== "confirmed" &&
      oldBooking.loyaltyPointsAwarded !== true
    ) {
      const user = await findUserForBooking(oldBooking);

      if (user) {
        const amount =
          Number(oldBooking.estimatedTotal || 0) ||
          Number(oldBooking.menuTotal || 0) + Number(oldBooking.spaceFee || 0);

        const loyaltyResult = await addLoyaltyPointsToUser(user, amount);

        if (loyaltyResult) {
          updateData.customerId = loyaltyResult.userId;
          updateData.loyaltyPointsAwarded = true;
          updateData.earnedPoints = loyaltyResult.earnedPoints;
        }
      }
    }

    await BookingSpace.findByIdAndUpdate(req.params.id, updateData);

    res.redirect("/staff/bookings");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// =========================
// CUSTOMERS
// =========================

router.get("/customers", async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer"
    })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    res.render("staff/customers/list", {
      customers
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get("/customers/:id", async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select("-passwordHash");

    if (!customer) {
      return res.status(404).send("Không tìm thấy khách hàng");
    }

    res.render("staff/customers/detail", {
      customer
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

module.exports = router;