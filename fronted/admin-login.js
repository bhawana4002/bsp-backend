document.getElementById("adminLoginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const adminId = parseInt(document.getElementById("adminId").value.trim());
    const password = document.getElementById("adminPassword").value.trim();

    const backendURL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
        ? "http://127.0.0.1:8000" 
        : "https://bsp-backend-phwb.onrender.com";

    try {
        const response = await fetch(`${backendURL}/api/login/admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plno: adminId, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Admin Login Successful!", "success");
            localStorage.setItem("loggedInAdmin", "true");
            setTimeout(() => window.location.href = "admin-dashboard.html", 800);
        } else {
            let errorMsg = data.detail;
            if (typeof errorMsg === 'object') errorMsg = "Invalid ID or Password format!";
            showToast(errorMsg || "Invalid Credentials!", "error");
        }
    } catch (error) {
        showToast("Server error! Is Python running?", "error");
    }
});