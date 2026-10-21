document.getElementById("adminLoginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const adminId = document.getElementById("adminId").value.trim();
    const password = document.getElementById("adminPassword").value.trim();

    try {
        // Python Backend ko request bhej rahe hain
        const response = await fetch("http://127.0.0.1:8000/api/login/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adminId: adminId, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Admin Login Successful!", "success");
            localStorage.setItem("loggedInAdmin", "true");
            setTimeout(() => window.location.href = "admin-dashboard.html", 800);
        } else {
            showToast(data.detail || "Invalid Credentials!", "error");
        }
    } catch (error) {
        showToast("Server error! Is Python running?", "error");
    }
});