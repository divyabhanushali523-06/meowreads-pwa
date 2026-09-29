document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const selectedRole = document.querySelector('input[name="loginRole"]:checked').value;
        const phone = document.getElementById("loginPhone").value;

        // Store temporary session data for OTP verification
        sessionStorage.setItem("pendingRole", selectedRole);
        sessionStorage.setItem("pendingPhone", phone);
        sessionStorage.setItem("authMode", "login");

        // Redirect to OTP Verification
        window.location.href = "otp.html";
    });
});

// Function to request OTP
async function requestMockOTP(phoneNumber) {
    const res = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber })
    });
    const data = await res.json();
    alert(`Mock OTP sent! (Check terminal or use code: ${data.debug_otp})`);
}

// Function to verify OTP
async function verifyMockOTP(phoneNumber, userEnteredCode) {
    const res = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, otp: userEnteredCode })
    });
    const data = await res.json();
    if (data.success) {
        alert("Login successful!");
    } else {
        alert("Incorrect OTP!");
    }
}