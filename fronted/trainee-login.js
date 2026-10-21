document.getElementById("traineeLoginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const id = document.getElementById("traineeId").value.trim();
    const pass = document.getElementById("traineePassword").value.trim();

    try {
        // Backend se verify karwa rahe hain
        const response = await fetch("http://127.0.0.1:8000/api/login/trainee", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id, password: pass })
        });

        const data = await response.json();

        if (response.ok) {
            showToast(`Welcome, ${data.user.name}!`, "success");
            // Backend se aaya hua data save kar rahe hain
            localStorage.setItem("loggedInTrainee", JSON.stringify(data.user)); 
            setTimeout(() => window.location.href = "trainee-dashboard.html", 800);
        } else {
            showToast(data.detail || "Invalid ID or Password!", "error");
        }
    } catch (error) {
        showToast("Server error! Is Python running?", "error");
    }
});