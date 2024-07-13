const socket = io();

document.addEventListener("DOMContentLoaded", () => {
  const productForm = document.getElementById("productForm");
  const userId = document.getElementById("userId").value;

  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const productData = {};

    formData.forEach((value, key) => {
      productData[key] = value;
    });

    productData.owner = userId;

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Error al agregar el producto");
      }

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          title: "Listo",
          text: data.message,
          icon: "success",
          confirmButtonText: "OK",
        });

        socket.emit("requestProducts");
      } else {
        throw new Error(data.error || "Error al agregar el producto");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire(
        "Error",
        error.message || "Error al agregar el producto",
        "error"
      );
    }
  });

  socket.on("productos", (productos) => {
    const productList = document.getElementById("userProductsList");
    productList.innerHTML = "";

    productos.forEach((product) => {
      const newItem = document.createElement("li");
      newItem.innerHTML = `
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <p>Precio: $${product.price}</p>
        <form class="deleteForm" data-product-id="${product._id}">
          <button type="button" class="deleteButton">Eliminar</button>
        </form>
      `;
      productList.appendChild(newItem);
    });
  });

  socket.on("productAdded", (data) => {
    if (data.success) {
      Swal.fire({
        title: "Listo",
        text: data.message,
        icon: "success",
        confirmButtonText: "OK",
      });

      socket.emit("requestProducts");
    }
  });

  document
    .getElementById("userProductsList")
    .addEventListener("click", (event) => {
      if (event.target.classList.contains("deleteButton")) {
        const productId = event.target
          .closest(".deleteForm")
          .getAttribute("data-product-id");
        socket.emit("deleteProduct", productId);
      }
    });

  socket.emit("requestProducts");
});
