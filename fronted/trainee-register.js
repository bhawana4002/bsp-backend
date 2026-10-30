document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const msgBox = document.getElementById("messageBox");
    const btn = document.getElementById("submitBtn");

    const formData = {
        yyyy: parseInt(document.getElementById("yyyy").value),
        rollNumber: document.getElementById("rollNumber").value.trim(),
        name: document.getElementById("name").value.trim(),
        college: document.getElementById("college").value.trim(),
        fromDate: document.getElementById("fromDate").value,
        toDate: document.getElementById("toDate").value,
        guideName: document.getElementById("guideName").value.trim(),
        projectTitle: document.getElementById("projectTitle").value.trim(),
        password: document.getElementById("password").value,
        insBy: 1001
    };

    if (!formData.yyyy || !formData.rollNumber || !formData.name || !formData.college) {
        msgBox.className = "message-box error"; msgBox.innerText = "Please fill required fields."; return;
    }

    btn.disabled = true; btn.innerText = "Registering...";
    msgBox.className = "message-box";
    
    const backendURL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
        ? "http://127.0.0.1:8000" 
        : "https://bsp-backend-phwb.onrender.com";

    try {
        const response = await fetch(`${backendURL}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            msgBox.className = "message-box success";
            msgBox.innerText = `Registration Successful! Your ID is: ${data.trainee_id}`;
            document.getElementById("registerForm").reset();
        } else {
            msgBox.className = "message-box error";
            msgBox.innerText = data.detail || "Registration Failed!";
        }
    } catch (error) {
        msgBox.className = "message-box error";
        msgBox.innerText = "Server error! Is backend running?";
    } finally {
        btn.disabled = false; 
        btn.innerText = "Register Trainee";
    }
});