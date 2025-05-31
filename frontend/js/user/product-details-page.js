async function fetchProductDetails() {
    const productId = window.location.pathname.split('/').pop();
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();

        if (product) {
            const productImage = document.getElementById("product-image");
            const productName = document.getElementById("product-name");
            const productDescription = document.getElementById("product-description");
            const productPrice = document.getElementById("product-price");

            if (productImage) productImage.src = product.imageUrl;
            if (productName) productName.textContent = product.name;
            if (productDescription) productDescription.textContent = product.description;
            if (productPrice && product.price !== undefined) productPrice.textContent = `$${product.price}`;

        } else {
            document.querySelector(".product-details-container").innerHTML = "<p>Producto no encontrado.</p>";
        }
    } catch (error) {
        document.querySelector(".product-details-container").innerHTML = "<p>Error al cargar los detalles del producto.</p>";
    }

    document.getElementById("button-purchase-product").addEventListener("click", () => {
    const productId = window.location.pathname.split('/').pop();//CREAMOS EL EVENTO PARA QUE AL HACER CLICK EN EL BOTON DE COMPRAR SE REDIRECCIONE A LA PAGINA DE COMPRA
    window.location.href = `/pages/user/purchase-page.html?productId=${productId}`;//LLEVNAOD EL PRODUCTO A LA PAGINA DE COMPRA
});

    document.getElementById("button-cancel-purchase").addEventListener("click", () => {
    window.location.href = "/";
    });
}

document.addEventListener("DOMContentLoaded", fetchProductDetails);