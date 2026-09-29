document.addEventListener("DOMContentLoaded", () => {
    const otpInputs = document.querySelectorAll(".otp-digit");
    const form = document.getElementById("otpForm");

    // Auto-focus next input box on digit entry
    otpInputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            if (input.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const role = sessionStorage.getItem("pendingRole") || "user";
        
        // Save verified active session
        localStorage.setItem("userRole", role);

        // Redirect to appropriate Dashboard
        if (role === "writer") {
            window.location.href = "writer_dashboard.html";
        } else {
            window.location.href = "user_dashboard.html";
        }
    });
});