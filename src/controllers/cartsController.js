const CartModel = require("../models/cart.model.js");
const CartManager = require("../repositories/cart.repository.js");
const cartManager = new CartManager();
const TicketModel = require("../models/ticket.model.js");
const UserModel = require("../models/user.model.js");
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();
const { generateUniqueCode, calculateTotal } = require("../utils/cartUtils.js");
const EmailManager = require("../services/email.js");
const emailManager = new EmailManager();
const authMiddleware = require("../middleware/authmiddleware.js");

class CartController {
  async createCart(req, res) {
    try {
      const newCart = await cartManager.createCart();
      res.json(newCart);
    } catch (error) {
      console.error("Error al crear un nuevo carrito", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async getCartByid(req, res) {
    const cid = req.params.cid;
    try {
      const cart = await cartManager.getCartByid(cid);

      if (!cart) {
        console.log("No existe un carrito con ese id");
        return res.status(404).json({ error: "Carrito no encontrado" });
      }

      return res.json(cart.products);
    } catch (error) {
      console.error("Error al obtener el carrito", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async addProductToCart(req, res) {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
      await cartManager.addProductToCart(cartId, productId, quantity);
      const cID = req.user.cart.toString();

      res.redirect(`/carts/${cID}`);
    } catch (error) {
      console.error("Error al agregar producto al carrito", error);
      res.status(500).send({ error: "Error interno del servidor" });
    }
  }

  async deleteProductFromCart(req, res) {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const updatedCart = await cartManager.deleteProductFromCart(
        cartId,
        productId
      );

      res.json({
        status: "success",
        message: "Producto eliminado del carrito correctamente",
        updatedCart,
      });
    } catch (error) {
      console.error("Error al eliminar el producto del carrito", error);
      res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      });
    }
  }

  async updateCart(req, res) {
    const cartId = req.params.cid;
    const updatedProducts = req.body;
    try {
      const updatedCart = await cartManager.updateCart(cartId, updatedProducts);
      res.json(updatedCart);
    } catch (error) {
      console.error("Error al actualizar el carrito", error);
      res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      });
    }
  }

  async updateProductQuantity(req, res) {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const newQuantity = req.body.quantity;

      const updatedCart = await cartManager.updateProductQuantity(
        cartId,
        productId,
        newQuantity
      );

      res.json({
        status: "success",
        message: "Cantidad del producto actualizada correctamente",
        updatedCart,
      });
    } catch (error) {
      console.error(
        "Error al actualizar la cantidad del producto en el carrito",
        error
      );
      res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      });
    }
  }

  async deleteCartContent(req, res) {
    try {
      const cartId = req.params.cid;
      const updatedCart = await cartManager.deleteCartContent(cartId);

      res.json({
        status: "success",
        message:
          "Todos los productos del carrito fueron eliminados correctamente",
        updatedCart,
      });
    } catch (error) {
      console.error("Error al vaciar el carrito", error);
      res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      });
    }
  }

  async completePurchase(req, res) {
    const cartId = req.params.cid;
    try {
      const cart = await cartManager.getCartByid(cartId);
      const products = cart.products;
      const outOfStockProducts = [];

      for (const item of products) {
        const productId = item.product;
        const product = await productRepository.getProductById(productId);
        if (product.stock >= item.quantity) {
          product.stock -= item.quantity;
          await product.save();
        } else {
          outOfStockProducts.push(productId);
        }
      }

      const userWithCart = await UserModel.findOne({ cart: cartId });

      const ticket = new TicketModel({
        code: generateUniqueCode(),
        purchase_datetime: new Date(),
        amount: calculateTotal(cart.products),
        purchaser: userWithCart._id,
      });
      await ticket.save();
      await cartManager.deleteCartContent(cartId);

      await emailManager.enviarCorreoCompra(
        userWithCart.email,
        userWithCart.first_name,
        ticket._id
      );

      authMiddleware;
      res.render("checkout", {
        cliente: userWithCart.first_name,
        email: userWithCart.email,
        numTicket: ticket._id,
        user: req.user,
        isAuthenticated: req.isAuthenticated,
      });
    } catch (error) {
      console.error("Error al procesar la compra:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

module.exports = CartController;
