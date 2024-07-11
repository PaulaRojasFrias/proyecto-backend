const socket = io();
const role = document.getElementById("role").textContent;
const email = document.getElementById("email").textContent;

socket.on("products", (data) => {
  renderProductos(data);
});

socket.on("productAdded", (data) => {
  if (data.success) {
    Swal.fire({
      title: "Listo",
      text: data.message,
      icon: "success",
      confirmButtonText: "OK",
    });
  }
});

const renderProductos = (productos) => {
  const contenedorProductos = document.getElementById("contenedorProductos");
  contenedorProductos.innerHTML = "";

  productos.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = ` 
      <p> ${item.title} </p>
      <p> ${item.price} </p>
      <button> Eliminar </button>
    `;

    contenedorProductos.appendChild(card);
    card.querySelector("button").addEventListener("click", () => {
      if (role === "premium" && item.owner === email) {
        eliminarProducto(item._id);
      } else if (role === "admin") {
        eliminarProducto(item._id);
      } else {
        Swal.fire({
          title: "Error",
          text: "No tienes permiso para borrar ese producto",
        });
      }
    });
  });
};

const eliminarProducto = (id) => {
  socket.emit("deleteProduct", id);
};

document.getElementById("productForm").addEventListener("submit", (event) => {
  event.preventDefault();
  agregarProducto();
});

const agregarProducto = () => {
  const role = document.getElementById("role").textContent;
  const email = document.getElementById("email").textContent;

  const owner = role === "premium" ? email : "admin";

  const producto = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    price: document.getElementById("price").value,
    img: document.getElementById("img").value,
    code: document.getElementById("code").value,
    stock: document.getElementById("stock").value,
    category: document.getElementById("category").value,
    status: document.getElementById("status").value === "true",
    owner,
  };

  console.log("Producto a agregar:", producto);

  socket.emit("addProduct", producto);
};
