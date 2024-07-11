const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/productsController.js");
const productController = new ProductController();
const passport = require("passport");

router.get("/", async (req, res) => {
  try {
    await productController.getProducts(req, res);
  } catch (error) {
    console.log("Error al obtener los productos", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    await productController.getProductById(req, res);
  } catch (error) {
    console.log("Error al obtener el producto", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      await productController.addProduct(req, res);
    } catch (error) {
      console.error("Error al agregar producto", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

router.put("/:id", async (req, res) => {
  try {
    await productController.updateProduct(req, res);
  } catch (error) {
    console.error("Error al actualizar producto", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await productController.deleteProduct(req, res);
  } catch (error) {
    console.error("Error al eliminar producto", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
