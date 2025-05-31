async function loadPurchasePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("productId");

  if (!productId) {
    alert("Producto no encontrado.");
    return;
  }

  try {
    const productRes = await fetch(`/api/products/${productId}`);//OBTENEMOS EL PRODUCTO POR SU ID USANDO LA API    
    const product = await productRes.json();

    const userRes = await fetch("/api/protected/user", { //OBTENEMOS EL USUARIO AUTENTICADO
      credentials: "include"
    });
    const user = await userRes.json();

    // CARGAMOS LOS DATOS DEL PRODUCTO
    document.getElementById("product-image").src = product.imageUrl;
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("total-price").textContent = `$${product.price}`;
    document.getElementById("final-total").textContent = `$${product.price}`;

    if(!user || !user.email) {// CREAMOS UN IF RAPIDO DONDE SI EL USUARIO NO ESTA LOGEADO LO MANDA A INICIAR SESION
      window.location.href = "/pages/auth/login.html";
      return;
    }else{// CARGAMOS LOS DATOS DEL USUARIO EN EL FORMULARIO SI SE CUMPLE LA CONDICION
    document.getElementById("user-address").value = user.address;
    document.getElementById("user-phone").value = user.phone;
    }

    // CARGAMOS LOS DATOS DEL FORMULARIO HACIENDO QUE SE ACTUALIZE EL PRECIO TOTAL
    const quantityInput = document.getElementById("quantity");
    quantityInput.addEventListener("input", () => {
      const quantity = parseInt(quantityInput.value);
      const total = quantity * product.price;
      document.getElementById("total-price").textContent = `$${total}`;
      document.getElementById("final-total").textContent = `$${total}`;
    });

    // Comprar
    document.getElementById("confirm-button").addEventListener("click", async () => {
  const quantity = parseInt(document.getElementById("quantity").value);
  const message = document.getElementById("message").value;

  const response = await fetch("/api/purchase/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      product,
      quantity,
      message,
    }),
  });

  if (response.ok) {
    alert("¡Compra realizada exitosamente! Se ha enviado una factura a tu correo.");
    window.location.href = "/";
  } else {
    alert("Ocurrió un error al confirmar tu compra.");
  }
});


    // Cancelar
    document.getElementById("cancel-button").addEventListener("click", () => {
      window.location.href = "/";
    });

  } catch (err) {
    console.error("Error al cargar la página de compra:", err);
    alert("Hubo un error cargando el producto o usuario.");
  }
}

document.addEventListener("DOMContentLoaded", loadPurchasePage);
