document.addEventListener("DOMContentLoaded", () => {
    const digits = document.querySelectorAll(".otp-digit");
    const otpForm = document.getElementById("otpForm");
    const btnResend = document.getElementById("btnResend");
    const phone = sessionStorage.getItem("pendingPhone");
    const mode = sessionStorage.getItem("authMode");

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

    // Helper to send OTP from backend
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

    // Automatically send OTP when page loads
    sendOTP();

    // Resend OTP button handler
    btnResend.addEventListener("click", (e) => {
        e.preventDefault();
        sendOTP();
    });

    // Form submission handler
    otpForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Combine the 4 digit input boxes into a single code string
        const otpCode = Array.from(digits).map(input => input.value).join("");

        try {
            // Verify OTP with backend
            const res = await fetch("/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone_number: phone, otp: otpCode })
            });
            const result = await res.json();

            if (result.success) {
                if (mode === "register") {
                    // Complete registration in MySQL backend
                    const regRes = await fetch("/api/register-writer", {
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
                        window.location.href = "writer_dashboard.html";
                    } else {
                        alert("Registration Error: " + (regData.message || regData.error));
                    }
                } else {
                    alert("Login successful!");
                    sessionStorage.clear();
                    window.location.href = "writer_dashboard.html";
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