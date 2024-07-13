const express = require("express");
const router = express.Router();
const CartController = require("../controllers/cartsController.js");
const cartController = new CartController();
const authMiddleware = require("../middleware/authmiddleware.js");

router.use(authMiddleware);

router.post("/", async (req, res) => {
  try {
    await cartController.createCart(req, res);
  } catch (error) {
    console.error("Error al crear un nuevo carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    await cartController.getCartByid(req, res);
  } catch (error) {
    console.error("Error al obtener el carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    await cartController.addProductToCart(req, res);
  } catch (error) {
    console.error("Error al agregar producto al carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    await cartController.deleteProductFromCart(req, res);
  } catch (error) {
    console.error("Error al eliminar el producto del carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    await cartController.updateCart(req, res);
  } catch (error) {
    console.error("Error al actualizar el carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/:cid/product/:pid", async (req, res) => {
  try {
    await cartController.updateProductQuantity(req, res);
  } catch (error) {
    console.error(
      "Error al actualizar la cantidad del producto en el carrito",
      error
    );
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    await cartController.deleteCartContent(req, res);
  } catch (error) {
    console.error("Error al vaciar el carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/:cid/purchase", async (req, res) => {
  try {
    await cartController.completePurchase(req, res);
  } catch (error) {
    console.error("Error al finalizar la compra", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
