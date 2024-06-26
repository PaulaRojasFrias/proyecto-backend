const CartModel = require("../models/cart.model.js");

class CartRepository {
  async createCart() {
    try {
      const newCart = new CartModel({ products: [] });
      await newCart.save();
      return newCart;
    } catch (error) {
      console.log("Error al crear el nuevo carrito");
      throw new Error("Error");
    }
  }

  async getCartByid(cartId) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        console.log("No existe un carrito con ese id");
        return null;
      }
      return cart;
    } catch (error) {
      console.log("Error al obtener el carrito", error);
      throw new Error("Error");
    }
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    try {
      const cart = await this.getCartByid(cartId);
      const productExist = cart.products.find(
        (item) => item.product._id.toString() === productId
      );

      if (productExist) {
        productExist.quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }
      cart.markModified("products");
      await cart.save();
      return cart;
    } catch (error) {
      console.log("Error al agregar producto al carrito", error);
      throw new Error("Error");
    }
  }

  async deleteProductFromCart(cartId, productId) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        console.log("No existe un carrito con ese id");
        throw new Error("Carrito no encontrado");
      }
      cart.products = cart.products.filter(
        (item) => item.product._id.toString() !== productId
      );
      await cart.save();
      return cart;
    } catch (error) {
      console.error("Error al eliminar el producto del carrito", error);
      throw new Error("Error");
    }
  }

  async updateCart(cartId, updatedProducts) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }
      cart.products = updatedProducts;
      cart.markModified("products");
      await cart.save();
      return cart;
    } catch (error) {
      console.error("Error al actualizar el carrito", error);
      throw new Error("Error");
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }
      const productIndex = cart.products.findIndex(
        (item) => item._id.product.toString() === productId
      );
      if (productIndex !== -1) {
        cart.products[productIndex].quantity = quantity;
        cart.markModified("products");
        await cart.save();
        return cart;
      } else {
        throw new Error("Producto no encontrado en el carrito");
      }
    } catch (error) {
      console.error(
        "Error al actualizar la cantidad del producto en el carrito",
        error
      );
      throw error;
    }
  }

  async deleteCartContent(cartId) {
    try {
      const cart = await CartModel.findByIdAndUpdate(
        cartId,
        { products: [] },
        { new: true }
      );
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }
      return cart;
    } catch (error) {
      console.error("Error al vaciar el carrito", error);
      throw error;
    }
  }
}

module.exports = CartRepository;
