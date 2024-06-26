const express = require("express");
const router = express.Router();
const Product = require("../models/product");

// Getting user products
router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit);
  try {
    const products = await Product.find({ status: true }).limit(limit);
    const allData = {
      productDetails: products,
    };
    res.json(allData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Getting admin products
router.get("/admin/products", async (req, res) => {
  const limit = parseInt(req.query.limit);
  try {
    const products = await Product.find({}).limit(limit);
    const allData = {
      productDetails: products,
    };
    res.json(allData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Getting One
// router.get("/:id", getProduct, (req, res) => {
//   res.json(res.product);
// });

// GET query for Nav Menu and Submenu
router.get("/nav/:menu/:sublabel", async (req, res) => {
  const menu = req.params.menu.toLowerCase();
  const sublabel = req.params.sublabel.toLowerCase() || undefined;

  console.log(menu);
  console.log(sublabel);

  let gender;
  if (menu === "men") {
    gender = "male";
  } else if (menu === "women") {
    gender = "female";
  } else {
    gender = menu;
  }
  let query;
  if (menu === "men" || menu === "women") {
    // If menu is either men or women, set gender
    const gender = menu === "men" ? "male" : "female";
    query = {
      gender,
      status: true,
    };
  } else {
    // If menu is not men or women, set category
    query = {
      $and: [{ category: menu }],
      status: true,
    };
    // If sublabel is defined, add it to the query
    if (sublabel !== "undefined") {
      query.$and.push({ sublabel });
    }
  }

  try {
    const products = await Product.find(query);

    const searchData = {
      products: products,
    };

    res.json(searchData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// Search Products by category name
router.get("/category/:key", async (req, res) => {
  let data = await Product.find({
    $or: [{ category: { $regex: req.params.key } }, { status: true }],
  });
  res.send(data);
});

// Search Product by name, description and category,
router.get("/search/:key", async (req, res) => {
  const searchKey = req.params.key.replace(/\s/g, "\\s");
  const regex = new RegExp(searchKey, "i");

  let genderRegex;
  if (searchKey.toLowerCase() === "men") {
    genderRegex = /\bmale\b/i;
  } else if (searchKey.toLowerCase() === "women") {
    genderRegex = /\bfemale\b/i;
  } else {
    genderRegex = new RegExp(searchKey, "i");
  }

  const data = await Product.find({
    $and: [
      {
        $or: [
          { name: { $regex: regex } },
          { description: { $regex: regex } },
          { category: { $regex: regex } },
          { gender: { $regex: genderRegex } },
        ],
      },
      { status: true },
    ],
  });

  res.send(data);
});

// Creating one
router.post("/", async (req, res) => {
  try {
    const product = new Product({
      image: req.body.image,
      name: req.body.name,
      discountedPrice: req.body.discountedPrice,
      originalPrice: req.body.originalPrice,
      description: req.body.description,
      quantity: req.body.quantity,
      gender: req.body.gender,
      category: req.body.category,
      status: req.body.status,
      badge: req.body.badge,
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Updating One
router.patch("/:id", getProduct, async (req, res) => {
  try {
    Object.assign(res.product, req.body);
    const updatedProduct = await res.product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Deleting One
router.delete("/:id", getProduct, async (req, res) => {
  try {
    await res.product.deleteOne();
    res.json({ message: "Deleted Product" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (product == null) {
      return res.status(404).json({ message: "Cannot find product" });
    }
    res.product = product;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = router;
