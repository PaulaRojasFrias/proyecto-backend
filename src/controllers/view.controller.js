const ProductModel = require("../models/product.model.js");
const CartRepository = require("../repositories/cart.repository.js");
const cartRepository = new CartRepository();
const passport = require("passport");
const authMiddleware = require("../midleware/authmiddleware.js");

class ViewsController {
  async renderProducts(req, res) {
    try {
      const { page = 1, limit = 3 } = req.query;

      const skip = (page - 1) * limit;

      const productos = await ProductModel.find().skip(skip).limit(limit);

      const totalProducts = await ProductModel.countDocuments();

      const totalPages = Math.ceil(totalProducts / limit);

      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;

      const nuevoArray = productos.map((producto) => {
        const { _id, ...rest } = producto.toObject();
        return { id: _id, ...rest };
      });

      const cartId = req.user.cart.toString();

      res.render("products", {
        productos: nuevoArray,
        hasPrevPage,
        hasNextPage,
        prevPage: hasPrevPage ? parseInt(page) - 1 : null,
        nextPage: hasNextPage ? parseInt(page) + 1 : null,
        currentPage: parseInt(page),
        totalPages,
        cartId,
        user: req.user,
        isAuthenticated: req.isAuthenticated,
      });
    } catch (error) {
      console.error("Error al obtener productos", error);
      res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      });
    }
  }

  async renderCart(req, res) {
    const cartId = req.params.cid;
    try {
      const cart = await cartRepository.getCartByid(cartId);

      if (!cart) {
        console.log("No existe ese carrito con el id");
        return res.status(404).json({ error: "Carrito no encontrado" });
      }

      let totalPurchase = 0;

      const productsInCart = cart.products.map((item) => {
        const product = item.product.toObject();
        const quantity = item.quantity;
        const totalPrice = product.price * quantity;

        totalPurchase += totalPrice;

        return {
          product: { ...product, totalPrice },
          quantity,
          cartId,
        };
      });

      res.render("carts", {
        products: productsInCart,
        totalPurchase,
        cartId,
        user: req.user,
        isAuthenticated: req.isAuthenticated,
      });
    } catch (error) {
      console.error("Error al obtener el carrito", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async renderLogin(req, res) {
    res.render("login", { isInLoginPage: true });
  }

  async renderRegister(req, res) {
    res.render("register", { isInRegisterPage: true });
  }

  async renderRealTimeProducts(req, res) {
    try {
      res.render("realtimeproducts");
    } catch (error) {
      console.error("Error en la vista real time", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async renderChat(req, res) {
    res.render("chat");
  }

  async renderHome(req, res) {
    res.render("home");
  }

  async renderResetPassword(req, res) {
    res.render("passwordreset");
  }

  async renderCambioPassword(req, res) {
    res.render("passwordcambio");
  }

  async renderConfirmacion(req, res) {
    res.render("confirmacion-envio");
  }

  async renderPremium(req, res) {
    res.render("panel-premium");
  }
}

module.exports = ViewsController;
