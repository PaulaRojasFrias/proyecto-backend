const socket = io();

document.getElementById("productForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const productData = {};

  formData.forEach((value, key) => {
    productData[key] = value;
  });

  socket.emit("addProduct", productData);
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
      const productId = event.target.closest(".deleteForm").dataset.productId;

      socket.emit("deleteProduct", productId);
    }
  });

socket.emit("requestProducts");
