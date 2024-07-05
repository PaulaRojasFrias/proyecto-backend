const socket = io();

// Manejar la solicitud POST del formulario
document.getElementById("productForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const productData = {};

  formData.forEach((value, key) => {
    productData[key] = value;
  });

  // Emitir el evento para agregar un producto usando Socket.IO
  socket.emit("addProduct", productData);
});

// Manejar actualizaciones en tiempo real de la lista de productos
socket.on("productos", (productos) => {
  const productList = document.getElementById("userProductsList");
  productList.innerHTML = "";

  // Limpiar la lista antes de agregar los nuevos productos
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

// Manejar el evento de producto agregado correctamente
socket.on("productAdded", (data) => {
  if (data.success) {
    Swal.fire({
      title: "Listo",
      text: data.message,
      icon: "success",
      confirmButtonText: "OK",
    });

    // Solicitar la lista actualizada de productos
    socket.emit("requestProducts");
  }
});

// Manejar la eliminación de productos
document
  .getElementById("userProductsList")
  .addEventListener("click", (event) => {
    if (event.target.classList.contains("deleteButton")) {
      const productId = event.target.closest(".deleteForm").dataset.productId;

      // Emitir el evento para eliminar un producto usando Socket.IO
      socket.emit("deleteProduct", productId);
    }
  });

// Solicitar la lista de productos al conectar
socket.emit("requestProducts");
