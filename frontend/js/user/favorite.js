
const createMenuIcon = (prod) => {
    const menu = document.createElement("div");
    menu.className = "menu-icon";
    menu.innerHTML = `
        <div class="icon-cart">
            <span class="material-symbols-outlined" data-state="default">shopping_cart</span>
        </div>
        <div class="icon-favorite">
            <span class="material-symbols-outlined" data-state>stars</span>
        </div>
    `;

    const cartIcon = menu.querySelector(".icon-cart span");
    const favIcon = menu.querySelector(".icon-favorite span");
    
    cartIcon.addEventListener("click", (e) => { //CODIGO PARA CAMBIAR EL ICONO DEL CARRITO
        e.stopPropagation(); // Evitar que el evento se propague al div padre
        e.preventDefault(); // Evitar el comportamiento por defecto del evento
        const isDefault = cartIcon.getAttribute("data-state") === "default"; // SE USA EL ATRIBUTO DATA-STATE PARA SABER SI EL ICONO ES DEFAULT O NO
        cartIcon.textContent = isDefault ? "shopping_cart_off" : "shopping_cart";//SI EL ATRIBUTO ES DEFAULT CAMBIA EL ICONO A shopping_cart_off Y SI NO CAMBIA A shopping_cart
        cartIcon.setAttribute("data-state", isDefault ? "off" : "default");
        
        console.log(`Carrito: ${prod._id} - ${isDefault ? 'añadido' : 'eliminado'}`);
        // Puedes llamar a tu API de carrito aquí
    });

    favIcon.addEventListener("click", async (e) => { //EVENTO PARA ELIMINAR UN DE FAVORITOS
        e.stopPropagation(); // Evitar que el evento se propague al div padre
        e.preventDefault(); // Evitar el comportamiento por defecto del evento
        try {
            console.log("Eliminando favorito con ID:", prod._id);
            const res = await fetch("/api/favorites/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId: prod._id }) 
            });
            const data = await res.json();
            if (data.success) {
                console.log("Producto eliminado de favoritos");
                window.location.reload(); // Recarga la página para mostrar la lista actualizada
            } else {
                console.error("Error al eliminar de favoritos (API):", data.message || "Error desconocido");
            }
        } catch (err) {
            console.error("Error al eliminar de favoritos (fetch):", err);
        }
    });

    // Este evento de carrito aquí es para un producto específico, puede que ya lo tengas en otro lado.
    // Si la lógica de carrito es global, asegúrate de no duplicarla innecesariamente.
    cartIcon.addEventListener("click", async () => { //EVENTO PARA AGREGAR A CARRITO
        try {
            console.log("Agregando al carrito con ID:", prod._id);
            await fetch("/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId: prod._id }) 
            });
            console.log("Producto agregado al carrito");
        } catch (err) {
            console.error("Error al agregar al carrito:", err);
        }
    });

    return menu;
};

// Función para renderizar productos (en este caso, favoritos)
const renderFavorites = (products) => {
    const container = document.getElementById("favorites-container");
    container.innerHTML = ""; // Limpiar contenedor

    if (products.length === 0) {
        container.innerHTML = "<p>No se encontraron productos favoritos.</p>";
        return;
    }

    products.forEach(product => {
        const link_card = document.createElement("a");
        link_card.href = `/products/${product._id}`; // Asegúrate de que esta ruta sea correcta para ver detalles del producto
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

        div.addEventListener("mouseenter", () => {
            menu.style.display = "flex";
        });
        div.addEventListener("mouseleave", () => {
            menu.style.display = "none";
        });

        link_card.appendChild(div);
        container.appendChild(link_card);
    });
};

// Función para cargar todos los favoritos (inicialmente y después de búsqueda vacía)
const loadAllFavorites = async () => {
    try {
        const res = await fetch("/api/favorites", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
            renderFavorites(data.favorites);
        } else {
            alert("INICIA SESION PARA PODER VER TUS PRODUCTOS FAVORITOS");
            window.location.href = "/pages/auth/login.html";
        }
    } catch (err) {
        console.error("Error al cargar favoritos (fetch):", err);
        document.getElementById("favorites-container").innerHTML = "<p>Error al cargar los favoritos.</p>";
    }
};

// Función para manejar la lógica de búsqueda ESPECÍFICA DE FAVORITOS
function handleFavoriteSearch(searchTerm) {
    console.log(`favorite.js: Buscando favoritos con término: "${searchTerm}"`);
    const favoritesContainer = document.getElementById('favorites-container');
    
    if (!searchTerm) {
        loadAllFavorites(); // Si la búsqueda está vacía, carga todos los favoritos
        return;
    }

    loadAllFavorites().then(() => {
        const allLoadedFavorites = Array.from(favoritesContainer.children).map(child => {
            // Extrae la información del producto de la tarjeta para filtrar
            const name = child.querySelector('h3').textContent.toLowerCase();
            const description = child.querySelector('p')?.textContent.toLowerCase() || ''; // Descripción puede no existir
            return { element: child, name, description };
        });

        const filtered = allLoadedFavorites.filter(item => 
            item.name.includes(searchTerm.toLowerCase()) || 
            item.description.includes(searchTerm.toLowerCase())
        );

        favoritesContainer.innerHTML = ''; // Limpia el contenedor
        if (filtered.length > 0) {
            filtered.forEach(item => favoritesContainer.appendChild(item.element));
        } else {
            favoritesContainer.innerHTML = "<p>No se encontraron favoritos que coincidan con la búsqueda.</p>";
        }
    });
}

// --- DELEGACIÓN DE EVENTOS PARA LA BARRA DE BÚSQUEDA DEL NAVBAR DINÁMICO ---
// Escucha en el 'document' para el formulario con id 'search-form'
document.addEventListener('submit', (event) => {

    if (event.target && event.target.id === 'search-form') {
        event.preventDefault(); // Evitar el envío tradicional del formulario
        
        const searchInput = event.target.querySelector('#search-input');
        const searchTerm = searchInput ? searchInput.value.trim() : '';

        // Llama a la función de búsqueda de favoritos
        handleFavoriteSearch(searchTerm);
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
            console.warn("favorite.js: Formulario de búsqueda '#search-form' no encontrado al hacer clic en el ícono.");
        }
    }
});

// Cargar todos los favoritos inicialmente cuando la página se carga
document.addEventListener("DOMContentLoaded", () => {
    loadAllFavorites();
});