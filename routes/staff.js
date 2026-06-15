const express = require('express');
const router  = express.Router();
const requireStaff = require('../middleware/requireStaff');
const path = require("path");
const fs = require("fs");
const multer = require("multer");

//Models
const Book                = require('../models/Book');
const DrinkProduct        = require('../models/DrinkProduct');
const SnackProduct        = require('../models/SnackProduct');
const CafeOrder           = require('../models/CafeOrder');
const BookOrderDetail     = require('../models/BookOrderDetail');
const DrinkOrderDetail    = require('../models/DrinkOrderDetail');
const WorkingSpaceBooking = require('../models/WorkingSpaceBooking');
const EventRegistration   = require('../models/EventRegistration');
const Deposit             = require('../models/Deposit');
const EventDrinkItem      = require('../models/EventDrinkItem');
const EventSnackItem      = require('../models/EventSnackItem');
const Customer            = require('../models/Customer');
const LoyalMember         = require('../models/LoyalMember');
const Order               = require("../models/Order");
const Product             = require("../models/Product");
const BookingSpace        = require("../models/BookingSpace");
const User                = require("../models/User");

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
};

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

// Protect all staff routes
router.use(requireStaff);

//  DASHBOARD

router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      pendingOrders,
      ordersToday,
      pendingBookings,
      upcomingEvents,
      depositsToConfirm,
      bookStockResult
    ] = await Promise.all([
      CafeOrder.countDocuments({ order_status: 'pending' }),
      CafeOrder.countDocuments({ order_date: { $gte: today, $lt: tomorrow } }),
      WorkingSpaceBooking.countDocuments({ booking_status: 'pending' }),
      EventRegistration.countDocuments({ event_date: { $gte: today }, registration_status: { $ne: 'cancelled' } }),
      Deposit.countDocuments({ deposit_status: 'received' }),
      Book.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }])
    ]);

    res.render('staff/dashboard', {
      pendingOrders,
      ordersToday,
      pendingBookings,
      upcomingEvents,
      depositsToConfirm,
      bookStock: bookStockResult[0]?.total || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

// PRODUCTS - synced with customer backend collection "products"

// BOOKS

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

    const imageUrl = getProductImageUrl(req);
    const finalStatus = normalizeProductStatus(status, stock);

    await Product.create({
      name,
      slug: makeSlug(name),
      type: "book",
      category: "Book",
      price: Number(price) || 0,
      imageUrl,
      description: "",
      stock: Number(stock) || 0,
      status: finalStatus,
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

// DRINKS

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

    const imageUrl = getProductImageUrl(req);
    const finalStatus = normalizeProductStatus(status, stock);

    await Product.create({
      name,
      slug: makeSlug(name),
      type: "drink",
      category: category || "Drink",
      price: Number(price) || 0,
      imageUrl,
      description: "",
      stock: Number(stock) || 0,
      status: finalStatus,
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

// SNACKS

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

    const imageUrl = getProductImageUrl(req);
    const finalStatus = normalizeProductStatus(status, stock);

    await Product.create({
      name,
      slug: makeSlug(name),
      type: "snack",
      category: "Snack",
      price: Number(price) || 0,
      imageUrl,
      description: "",
      stock: Number(stock) || 0,
      status: finalStatus,
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

//  ORDERS - synced with customer backend collection "orders"

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

      if (product && quantity > 0) {
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
    }

    if (items.length === 0) {
      return res.status(400).send("Vui lòng chọn ít nhất một sản phẩm");
    }

    await Order.create({
      customerName: customerName || "Khách tại quầy",
      phone: phone || "Không có",
      email: email || "",
      items,
      customerType: "regular",
      totalAmount,
      orderType: orderType || "takeaway",
      paymentMethod: paymentMethod || "cash",
      paymentStatus:
        paymentStatus || (paymentMethod === "cash" ? "unpaid" : "paid"),
      status: status || "pending",
      isSeenByStaff: true,
      note: note || ""
    });

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

//  BOOKINGS - synced with customer backend collection "bookingspaces"

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

router.get("/bookings/add", (req, res) => {
  res.render("staff/bookings/booking-form");
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

    const spaceFee = Number(participantCount || 0) * 20000;

    await BookingSpace.create({
      customerName: customerName || "Khách tại quầy",
      phone: phone || "Không có",
      email: email || "staff-created@livrecafe.local",
      eventName: eventName || "Đặt chỗ làm việc",
      eventType: eventType || "study",
      eventDate,
      eventTime,
      participantCount: Number(participantCount) || 1,
      duration: duration || "1",
      selectedMenu: [],
      spaceFee,
      menuTotal: 0,
      estimatedTotal: spaceFee,
      status: status || "pending",
      isSeenByStaff: true,
      note: note || ""
    });

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

//  events

router.get('/events', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { registration_status: status } : {};
    const events = await EventRegistration.find(filter).sort({ event_date: 1 });
    res.render('staff/events/list', { events, currentStatus: status || 'all' });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/events/add', async (req, res) => {
  try {
    const drinks = await DrinkProduct.find({ status: 'available' }).sort({ drink_name: 1 });
    const snacks = await SnackProduct.find({ status: 'available' }).sort({ snack_name: 1 });
    res.render('staff/events/event-form', { drinks, snacks });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/events/add', async (req, res) => {
  try {
    const { event_name, event_date, start_time, end_time, participant_count, registration_status } = req.body;
    const drinkIds  = [].concat(req.body.drink_id  || []);
    const drinkQtys = [].concat(req.body.drink_qty || []);
    const snackIds  = [].concat(req.body.snack_id  || []);
    const snackQtys = [].concat(req.body.snack_qty || []);

    const event = await EventRegistration.create({
      event_name, event_date, start_time, end_time,
      participant_count, registration_status, quotation_amount: 0
    });
    let total = 0;

    for (let i = 0; i < drinkIds.length; i++) {
      if (!drinkIds[i]) continue;
      const drink = await DrinkProduct.findById(drinkIds[i]);
      const qty   = parseInt(drinkQtys[i]) || 1;
      if (drink) {
        await EventDrinkItem.create({ event_registration_id: event._id, drink_id: drink._id, quantity: qty, unit_price: drink.price });
        total += drink.price * qty;
      }
    }
    for (let i = 0; i < snackIds.length; i++) {
      if (!snackIds[i]) continue;
      const snack = await SnackProduct.findById(snackIds[i]);
      const qty   = parseInt(snackQtys[i]) || 1;
      if (snack) {
        await EventSnackItem.create({ event_registration_id: event._id, snack_id: snack._id, quantity: qty, unit_price: snack.price });
        total += snack.price * qty;
      }
    }
    await EventRegistration.findByIdAndUpdate(event._id, { quotation_amount: total });
    res.redirect('/staff/events');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/events/:id', async (req, res) => {
  try {
    const event = await EventRegistration.findById(req.params.id);
    if (!event) return res.status(404).send('Event not found');
    const deposit    = await Deposit.findOne({ event_registration_id: req.params.id });
    const drinkItems = await EventDrinkItem.find({ event_registration_id: req.params.id }).populate('drink_id');
    const snackItems = await EventSnackItem.find({ event_registration_id: req.params.id }).populate('snack_id');
    res.render('staff/events/detail', { event, deposit, drinkItems, snackItems });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/events/:id/status', async (req, res) => {
  try {
    await EventRegistration.findByIdAndUpdate(req.params.id, { registration_status: req.body.registration_status });
    res.redirect(`/staff/events/${req.params.id}`);
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/events/:id/confirm-deposit', async (req, res) => {
  try {
    await Deposit.findOneAndUpdate(
      { event_registration_id: req.params.id },
      { deposit_status: 'confirmed', deposit_date: new Date() }
    );
    await EventRegistration.findByIdAndUpdate(req.params.id, { registration_status: 'confirmed' });
    res.redirect(`/staff/events/${req.params.id}`);
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});


//  customers

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