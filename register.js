document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const selectedRole = document.querySelector('input[name="role"]:checked').value;
        const phone = document.getElementById("regPhone").value;
        const fullName = document.getElementById("regName").value;
        const username = document.getElementById("regUsername").value;
        const password = document.getElementById("regPassword").value;

        // Store temporary session data for registration & OTP verification
        sessionStorage.setItem("pendingRole", selectedRole);
        sessionStorage.setItem("pendingPhone", phone);
        sessionStorage.setItem("pendingFullName", fullName);
        sessionStorage.setItem("pendingUsername", username);
        sessionStorage.setItem("pendingPassword", password);
        sessionStorage.setItem("authMode", "register");

        // Redirect to OTP Verification
        window.location.href = "otp.html";
    });
});