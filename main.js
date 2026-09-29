// Functionality replacing MainActivity.java intent triggers
document.addEventListener("DOMContentLoaded", () => {
    const btnRegister = document.getElementById("btnRegister");
    const btnLogin = document.getElementById("btnLogin");

    // Connect Register button to register.html
    if (btnRegister) {
        btnRegister.addEventListener("click", () => {
            window.location.href = "register.html";
        });
    }

    // Connect Login button to login.html
    if (btnLogin) {
        btnLogin.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }
});