const createMenuIcon = (prod) => {
    const menu = document.createElement("div");
    menu.className = "menu-icon";
    menu.innerHTML = `
        <div class="icon-cart">
            <span class="material-symbols-outlined" data-state="default">shopping_cart_off</span>
        </div>
        <div class="icon-favorite">
            <span class="material-symbols-outlined" data-state>stars</span>
        </div>
    `;

    const cartIcon = menu.querySelector(".icon-cart span");
    const favIcon = menu.querySelector(".icon-favorite span");
    
    cartIcon.addEventListener("click", async (e) => { //EVENTO PARA ELIMINAR UN DE CARRITO
        e.stopPropagation(); // Evitar que el evento se propague al div padre
        e.preventDefault(); // Evitar el comportamiento por defecto del evento
        try {
            console.log("Eliminando cart con ID:", prod._id);
            const res = await fetch("/api/cart/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId: prod._id }) 
            });
            const data = await res.json();
            if (data.success) {
                console.log("Producto eliminado de carrito");
                window.location.reload(); // Recarga la página para mostrar la lista actualizada
            } else {
                console.error("Error al eliminar del carrito (API):", data.message || "Error desconocido");
            }
        } catch (err) {
            console.error("Error al eliminar del carrito (fetch):", err);
        }
    });

    favIcon.addEventListener("click", async (e) => { //EVENTO PARA AGREGAR A FAVORITOS
        e.stopPropagation(); // Evitar que el evento se propague al div padre
        e.preventDefault(); // Evitar el comportamiento por defecto del evento
        try {
            console.log("Agregando favorito con ID:", prod._id);
            const res = await fetch("/api/favorites/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId: prod._id }) 
            });
            const data = await res.json();
            if (data.success) {
                console.log("Producto agregado a favoritos");
                // Opcional: podrías cambiar el icono o mostrar un mensaje de éxito sin recargar
            } else {
                console.error("Error al agregar a favoritos (API):", data.message || "Error desconocido");
            }
        } catch (err) {
            console.error("Error al agregar a favoritos (fetch):", err);
        }
    });

    return menu;
};

const renderCartProducts = (products) => {
    const container = document.getElementById("car-products-container");
    container.innerHTML = ""; // Limpiar contenedor

    if (products.length === 0) {
        container.innerHTML = "<p>El carrito de compras está vacío.</p>";
        return;
    }

    products.forEach(product => { //LE PASAMOS EL PARAMETRO DE PRODUCTO A LA FUNCION PARA QUE PUEDA RECIBIR LA INFORMACION NECESARIA PARA ELIMINAR EL PRODUCTO
        const link_card = document.createElement("a");
        link_card.href = `/products/${product._id}`; // Asegúrate que esta ruta sea correcta para ver detalles del producto
        link_card.className = "product-link-card";

        const div = document.createElement("div");
        div.className = "product-card";
        div.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <strong>$${product.price}</strong>
        `;
        
        const menu = createMenuIcon(product);
        menu.style.display = "none";
        div.appendChild(menu);

        div.addEventListener("mouseenter", () => {  // Mostrar y ocultar el menú en hover
            menu.style.display = "flex";
        });
        div.addEventListener("mouseleave", () => {
            menu.style.display = "none";
        });

        link_card.appendChild(div);
        container.appendChild(link_card);
    });
};

// Función para cargar todos los productos del carrito
const loadAllCartProducts = async () => {
    try {
        const res = await fetch("/api/cart", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
            renderCartProducts(data.cart); // Llama a la función para renderizar
        }else {
            alert("INICIA SESION PARA PODER VER TU CARRITO");
            window.location.href = "/pages/auth/login.html";
        }
    } catch (err) {
        console.error("Error al cargar carrito (fetch):", err);
        document.getElementById("car-products-container").innerHTML = "<p>Error al cargar los productos del carrito.</p>";
    }
};

// Función para manejar la lógica de búsqueda ESPECÍFICA DE PRODUCTOS DEL CARRITO
function handleCartSearch(searchTerm) {
    console.log(`cartUser.js: Buscando en el carrito con término: "${searchTerm}"`);
    const cartContainer = document.getElementById('car-products-container');
    
    if (!searchTerm) {
        loadAllCartProducts(); // Si la búsqueda está vacía, carga todos los productos del carrito
        return;
    }

    // SIMULACIÓN DE FILTRADO EN CLIENTE (si tu /api/cart NO tiene búsqueda integrada)
    // Esto es menos eficiente para muchos productos, idealmente el backend filtra.
    loadAllCartProducts().then(() => { // Carga todos los productos primero para filtrar en el cliente
        const allLoadedCartProducts = Array.from(cartContainer.children).map(child => {
            // Extrae la información del producto de la tarjeta para filtrar
            const name = child.querySelector('h3').textContent.toLowerCase();
            const description = child.querySelector('p')?.textContent.toLowerCase() || ''; // Descripción puede no existir
            return { element: child, name, description };
        });

        const filtered = allLoadedCartProducts.filter(item => 
            item.name.includes(searchTerm.toLowerCase()) || 
            item.description.includes(searchTerm.toLowerCase())
        );

        cartContainer.innerHTML = ''; // Limpia el contenedor
        if (filtered.length > 0) {
            filtered.forEach(item => cartContainer.appendChild(item.element));
        } else {
            cartContainer.innerHTML = "<p>No se encontraron productos en el carrito que coincidan con la búsqueda.</p>";
        }
    });

    // CÓDIGO ALTERNATIVO SI TU BACKEND SOPORTA BÚSQUEDA ESPECÍFICA EN EL CARRITO:
    /*
    fetch(`/api/cart/search?q=${encodeURIComponent(searchTerm)}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderCartProducts(data.cart); // renderiza los productos del carrito filtrados por el backend
            } else {
                console.error("Error al buscar en carrito en API:", data.message || "Error desconocido");
                cartContainer.innerHTML = "<p>Error al buscar en el carrito.</p>";
            }
        })
        .catch(err => {
            console.error("Error en fetch de búsqueda de carrito:", err);
            cartContainer.innerHTML = "<p>Error en la búsqueda.</p>";
        });
    */
}


// --- DELEGACIÓN DE EVENTOS PARA LA BARRA DE BÚSQUEDA DEL NAVBAR DINÁMICO ---
// Escucha en el 'document' para el formulario con id 'search-form'
document.addEventListener('submit', (event) => {
    if (event.target && event.target.id === 'search-form') {
        event.preventDefault(); // Evitar el envío tradicional del formulario
        
        const searchInput = event.target.querySelector('#search-input');
        const searchTerm = searchInput ? searchInput.value.trim() : '';

        // Llama a la función de búsqueda del carrito
        handleCartSearch(searchTerm);
    }
});

// Escucha en el 'document' para el clic en el botón con id 'search-icon'
document.addEventListener('click', (event) => {
    const searchIcon = event.target.closest('#search-icon'); // Busca el botón de búsqueda por su ID
    if (searchIcon) {
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            // Si el ícono de búsqueda es clickeado, dispara el submit del formulario.
            searchForm.dispatchEvent(new Event('submit', { bubbles: true }));
        } else {
            console.warn("cartUser.js: Formulario de búsqueda '#search-form' no encontrado al hacer clic en el ícono.");
        }
    }
});


// Lógica para los botones "Comprar carrito" y "Eliminar carrito"
document.addEventListener("DOMContentLoaded", () => {
    // Cargar todos los productos del carrito inicialmente
    loadAllCartProducts();

    document.getElementById("buy-cart").addEventListener("click", () => {
        window.location.href = "/pages/user/purchase-cart-page.html";
    });

    let isClearing = false;
    document.getElementById("detele-car").addEventListener("click", async (e) => {
        e.preventDefault();
        if (isClearing) return;
        isClearing = true;

        if (confirm("¿Estás seguro de que deseas eliminar todo el carrito?")) {
            try {
                const res = await fetch("/api/cart/clear", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                if (res.ok) {
                    alert("Carrito eliminado correctamente.");
                    window.location.reload();
                } else {
                    alert("Error al eliminar el carrito.");
                }
            } catch (err) {
                console.error("Error al vaciar el carrito:", err);
                alert("Error inesperado al eliminar el carrito.");
            } finally {
                isClearing = false;
            }
        } else {
            isClearing = false;
        }
    });
});