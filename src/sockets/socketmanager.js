const socket = require("socket.io");
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();
const MessageModel = require("../models/message.model.js");

class SocketManager {
  constructor(httpServer) {
    this.io = require("socket.io")(httpServer);
    this.initSocketEvents();
  }

  async initSocketEvents() {
    this.io.on("connection", async (socket) => {
      console.log("Un cliente se conectó");

      socket.emit("products", await productRepository.getProducts());

      socket.on("deleteProduct", async (id) => {
        await productRepository.deleteProduct(id);
        this.emitUpdatedProducts();
      });

      socket.on("addProduct", async (product) => {
        await productRepository.addProduct(product);
        socket.emit("productAdded", {
          success: true,
          message: "Producto agregado correctamente",
        });
        this.emitUpdatedProducts();
      });

      socket.on("requestProducts", async () => {
        socket.emit("products", await productRepository.getProducts());
      });

      socket.on("message", async (data) => {
        await MessageModel.create(data);
        const messages = await MessageModel.find();
        socket.emit("message", messages);
      });
    });
  }

  async emitUpdatedProducts() {
    const products = await productRepository.getProducts();
    this.io.emit("products", products);
  }
}

module.exports = SocketManager;
