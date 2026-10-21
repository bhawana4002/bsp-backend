document.getElementById("togglePassword").addEventListener("click", function () {
    const pwd = document.getElementById("password");
    pwd.type = pwd.type === "password" ? "text" : "password";
    this.textContent = pwd.type === "password" ? "👁️" : "🙈";
});

document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const msgBox = document.getElementById("messageBox");
    const btn = document.getElementById("submitBtn");

    // Form data collect karna
    const formData = {
        fullName: document.getElementById("fullName").value.trim(),
        rollNumber: document.getElementById("rollNumber").value.trim(),
        phoneNumber: document.getElementById("phoneNumber").value.trim(),
        semester: document.getElementById("semester").value,
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
    };

    if (formData.phoneNumber.length !== 10) { 
        msgBox.className = "message-box error"; msgBox.innerText = "Phone must be 10 digits."; return; 
    }
    if (formData.password.length < 6) { 
        msgBox.className = "message-box error"; msgBox.innerText = "Password min 6 chars."; return; 
    }

    btn.disabled = true; btn.innerText = "Registering...";
    msgBox.className = "message-box";
    msgBox.style.display = "none";

    try {
        // Backend ko data bhej rahe hain
        const response = await fetch("http://127.0.0.1:8000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            msgBox.className = "message-box success";
            msgBox.innerText = `Registration Successful! Your Trainee ID is: ${data.trainee_id}`;
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