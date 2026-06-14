require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Product = require("./models/Product");

function createSlug(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeName(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function findImageFile(folderName, productName) {
  const imageDir = path.join(__dirname, "data", "image", folderName);

  if (!fs.existsSync(imageDir)) {
    return "";
  }

  const files = fs.readdirSync(imageDir);

  const normalizedProductName = normalizeName(productName);

  const matchedFile = files.find((file) => {
    const fileNameWithoutExt = path.parse(file).name;
    return normalizeName(fileNameWithoutExt) === normalizedProductName;
  });

  if (!matchedFile) {
    console.warn(`Không tìm thấy ảnh cho: ${productName}`);
    return "";
  }

  return `/images/${folderName}/${matchedFile}`;
}

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    const filePath = path.join(__dirname, "data", "livrecafe-products.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);

    const drinks = data.drinks.map((item) => {
      const name = item.drink_name;

      return {
        name,
        slug: createSlug(name),
        type: "drink",
        category: item.category,
        price: item.price,
        imageUrl: findImageFile("Drinks", name),
        description: "",
        stock: 20,
        status: "available",
        isBestSeller: false,
        isActive: true
      };
    });

    const snacks = data.snacks.map((item) => {
      const name = item.snack_name;

      return {
        name,
        slug: createSlug(name),
        type: "snack",
        category: "Snack",
        price: item.price,
        imageUrl: findImageFile("Snacks", name),
        description: "",
        stock: 20,
        status: "available",
        isBestSeller: false,
        isActive: true
      };
    });

    const books = data.books.map((item) => {
      const name = item.title;

      return {
        name,
        slug: createSlug(name),
        type: "book",
        category: "Book",
        author: item.author,
        publisher: item.publisher,
        price: item.price,
        imageUrl: findImageFile("Books", name),
        description: "",
        stock: 10,
        status: "available",
        isBestSeller: false,
        isActive: true,
        canReadAtCafe: true,
        canBuy: true
      };
    });

    const products = [...drinks, ...snacks, ...books];

    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log(`Inserted ${products.length} products successfully`);
    console.log(`Drinks: ${drinks.length}`);
    console.log(`Snacks: ${snacks.length}`);
    console.log(`Books: ${books.length}`);
  } catch (error) {
    console.error("Seed products failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

seedProducts();