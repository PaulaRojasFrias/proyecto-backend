const ProductModel = require("../models/product.model.js");
const CartRepository = require("../repositories/cart.repository.js");
const cartRepository = new CartRepository();
const UserModel = require("../models/user.model.js");
const passport = require("passport");

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
      const user = req.user;

      if (!user) {
        return res.status(401).send("Usuario no autenticado");
      }

      res.render("realtimeproducts", {
        role: user.role,
        email: user.email,
        user: user,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      console.error("Error en la vista real time", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async renderChat(req, res) {
    res.render("chat");
  }

  async renderHome(req, res) {
    try {
      const user = req.user ? req.user.toObject() : null;
      const isAuthenticated = req.isAuthenticated();

      const isAdmin = user.role === "admin";
      const isUser = user.role === "user";
      const isPremium = user.role === "premium";

      res.render("home", {
        user,
        isAuthenticated,
        isAdmin,
        isUser,
        isPremium,
      });
    } catch (error) {
      console.error("Error al renderizar la vista principal:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
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
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).send("Usuario no autenticado");
      }

      const userProducts = await ProductModel.find({ owner: user._id });

      res.render("panel-premium", {
        role: user.role,
        email: user.email,
        user: user,
        userProducts: userProducts, // Pasar los productos del usuario a la vista
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      console.error("Error en la vista real time", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
  async renderUsersView(req, res) {
    try {
      const users = await UserModel.find({}, "first_name last_name email role");
      const usersWithRoles = users.map((user) => ({
        ...user.toObject(),
        isAdmin: user.role === "admin",
        isUser: user.role === "user",
        isPremium: user.role === "premium",
      }));
      res.render("users", { users: usersWithRoles });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).send("Error al obtener usuarios");
    }
  }
}

module.exports = ViewsController;
