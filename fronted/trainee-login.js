document.getElementById("traineeLoginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const yyyy = parseInt(document.getElementById("traineeYear").value.trim());
    const rollNo = document.getElementById("traineeRollNo").value.trim();
    const pass = document.getElementById("traineePassword").value.trim();

    const backendURL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
        ? "http://127.0.0.1:8000" 
        : "https://bsp-backend-phwb.onrender.com";

    try {
        const response = await fetch(`${backendURL}/api/login/trainee`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ yyyy: yyyy, rollNumber: rollNo, password: pass })
        });

        const data = await response.json();

        if (response.ok) {
            showToast(`Welcome, ${data.user.name}!`, "success");
            localStorage.setItem("loggedInTrainee", JSON.stringify(data.user)); 
            setTimeout(() => window.location.href = "trainee-dashboard.html", 800);
        } else {
            showToast(data.detail || "Invalid Year, Roll No or Password!", "error");
        }
    } catch (error) {
        showToast("Server error! Is Python running?", "error");
    }
});