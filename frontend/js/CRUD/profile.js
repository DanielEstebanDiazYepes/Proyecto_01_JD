document.addEventListener("DOMContentLoaded", async () => { //CODIGO PARA MOSTRAR LA INFORMACION DEL USUARIO EN EL FORMULARIO
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
  
      if (data.loggedIn) {
        const user = data.user;
        document.getElementById("name").value = user.name || "";
        document.getElementById("address").value = user.address || "xxx";
        document.getElementById("phone").value = user.phone || "xxx";
        document.getElementById("email").value = user.email || "";
      } else {
        alert("INICIA SESION PARA PODER VER TU PERFIL");
        window.location.href = "/pages/auth/login.html";
      }
    } catch (error) {
      console.error("Error al obtener la sesión:", error);
    }
  });


  
document.getElementById("update-information").addEventListener("click", async (e) => {// CODIGO PARA ACTUALIZAR LA INFORMACION DEL USUARIO
    e.preventDefault();
  
    const updatedData = {
      name: document.getElementById("name").value,
      address: document.getElementById("address").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    };
  
    try {
      const res = await fetch("/api/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });
  
      const data = await res.json();
      if (data.success) {
        alert("✅ Información actualizada correctamente");
      } else {
        alert("❌ Error al actualizar la información");
      }
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert("Hubo un error");
    }
  });

  document.getElementById("delete-account").addEventListener("click", async (e) => {// CODIGO PARA ELIMINAR LA CUENTA DEL USUARIO
    e.preventDefault();
    const confirmDelete = confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.");
  
    if (!confirmDelete) return;
  
    try {
      const res = await fetch("/api/auth/delete", {
        method: "DELETE",
        credentials: "include"
      });
      
      const data = await res.json();

      if (data.success) {
        alert("Tu cuenta ha sido eliminada.");
        window.location.href = "/index.html";
      } else {
        alert("No se pudo eliminar la cuenta.");
      }
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      alert("Hubo un error al eliminar la cuenta");
    }
  });
  
  