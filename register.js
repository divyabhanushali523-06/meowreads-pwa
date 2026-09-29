document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const selectedRole = document.querySelector('input[name="role"]:checked').value;
        const phone = document.getElementById("regPhone").value;

        // Store temporary session data for OTP verification
        sessionStorage.setItem("pendingRole", selectedRole);
        sessionStorage.setItem("pendingPhone", phone);
        sessionStorage.setItem("authMode", "register");

        // Redirect to OTP Verification
        window.location.href = "otp.html";
    });
});