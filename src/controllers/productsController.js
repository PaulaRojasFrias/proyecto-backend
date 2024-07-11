const ProductModel = require("../models/product.model.js");
const ProductManager = require("../repositories/product.repository.js");
const manager = new ProductManager();
const EmailManager = require("../services/email.js");
const emailManager = new EmailManager();

class ProductController {
  async addProduct(req, res) {
    const newProduct = req.body;
    try {
      await manager.addProduct(newProduct);
      res.status(201).json({
        message: "Producto agregado exitosamente",
      });
    } catch (error) {
      console.error("Error al agregar producto", error);
      res.status(500).json({
        error: "Error interno del servidor",
      });
    }
  }

  async getProducts(req, res) {
    try {
      let { limit = 10, page = 1, sort, query } = req.query;

      const products = await manager.getProducts(limit, page, sort, query);

      res.json(products);
    } catch (error) {
      res.status(500).send("Error");
    }
  }

  async getProductById(req, res) {
    try {
      const id = req.params.id;
      const product = await manager.getProductById(id);

      if (product) {
        return res.json(product);
      } else {
        return res.json({
          error: "Producto no encontrado",
        });
      }
    } catch (error) {
      console.log("Error al obtener el producto", error);
      res.status(500).json({
        error: "Error interno del servidor",
      });
    }
  }

  async updateProduct(req, res) {
    const id = req.params.id;
    const updatedProduct = req.body;
    try {
      await manager.updateProduct(id, updatedProduct);
      res.json({
        message: "Producto actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar producto", error);
      res.status(500).json({
        error: "Error interno del servidor",
      });
    }
  }

  async deleteProduct(req, res) {
    const id = req.params.id;
    try {
      const product = await manager.getProductById(id);
      if (!product) {
        return res.status(404).json({
          error: "Producto no encontrado",
        });
      }
      await manager.deleteProduct(id);
      const owner = await UserModel.findById(product.owner);
      if (owner.role === "premium") {
        await emailManager.enviarCorreoProductoEliminado(
          owner.email,
          owner.first_name,
          product.name
        );
      }
      res.json({
        message: "Producto eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar producto", error);
      res.status(500).json({
        error: "Error interno del servidor",
      });
    }
  }
}

module.exports = ProductController;
