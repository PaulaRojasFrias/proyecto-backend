function deleteProduct(cartId, productId) {
  fetch(`/api/carts/${cartId}/product/${productId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error deleting product from cart");
      }
      location.reload();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function clearCart(cartId) {
  fetch(`/api/carts/${cartId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error clearing cart");
      }
      location.reload();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
