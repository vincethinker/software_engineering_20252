const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { type, category } = req.query;

    const filter = {
      isActive: true,
      status: { $ne: "hidden" }
    };

    if (type) {
      filter.type = type;
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({
      type: 1,
      name: 1
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy danh sách sản phẩm",
      error: error.message
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy chi tiết sản phẩm",
      error: error.message
    });
  }
});

module.exports = router;