document.addEventListener("DOMContentLoaded", () => {
    const digits = document.querySelectorAll(".otp-digit");
    const otpForm = document.getElementById("otpForm");
    const btnResend = document.getElementById("btnResend");
    const phone = sessionStorage.getItem("pendingPhone");
    const mode = sessionStorage.getItem("authMode");
    const role = sessionStorage.getItem("pendingRole") || "user"; // Defaults to reader/user

    // Route user based on their selected role
    function redirectBasedOnRole() {
        if (role === "writer") {
            window.location.href = "writer_dashboard.html";
        } else {
            window.location.href = "userdashboard.html"; // Redirects to reader userdashboard.html
        }
    }

    // Auto-focus move to next input box when typing digit
    digits.forEach((input, index) => {
        input.addEventListener("input", (e) => {
            if (e.target.value.length === 1 && index < digits.length - 1) {
                digits[index + 1].focus();
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !e.target.value && index > 0) {
                digits[index - 1].focus();
            }
        });
    });

    // Send OTP from backend
    async function sendOTP() {
        if (!phone) {
            alert("No phone number found. Please register or log in again.");
            window.location.href = "register.html";
            return;
        }

        try {
            const res = await fetch("/api/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone_number: phone })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Mock OTP sent to ${phone}! Debug Code: ${data.debug_otp}`);
            } else {
                alert(data.error || "Failed to send OTP.");
            }
        } catch (err) {
            console.error("Failed to connect to backend:", err);
            alert("Server connection error. Make sure app.py is running!");
        }
    }

    sendOTP();

    btnResend.addEventListener("click", (e) => {
        e.preventDefault();
        sendOTP();
    });

    otpForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const otpCode = Array.from(digits).map(input => input.value).join("");

        try {
            const res = await fetch("/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone_number: phone, otp: otpCode })
            });
            const result = await res.json();

            if (result.success) {
                if (mode === "register") {
                    const targetEndpoint = role === "writer" ? "/api/register-writer" : "/api/register-user";

                    const regRes = await fetch(targetEndpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            full_name: sessionStorage.getItem("pendingFullName"),
                            username: sessionStorage.getItem("pendingUsername"),
                            phone_number: phone,
                            password: sessionStorage.getItem("pendingPassword")
                        })
                    });
                    const regData = await regRes.json();

                    if (regData.success) {
                        alert("Account registered successfully!");
                        sessionStorage.clear();
                        redirectBasedOnRole();
                    } else {
                        alert("Registration Error: " + (regData.message || regData.error));
                    }
                } else {
                    alert("Login successful!");
                    sessionStorage.clear();
                    redirectBasedOnRole();
                }
            } else {
                alert("Invalid OTP code. Please try again.");
            }
        } catch (err) {
            console.error("Backend error:", err);
            alert("Server connection error. Make sure app.py is running!");
        }
    });
});