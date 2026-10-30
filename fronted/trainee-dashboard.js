const userStr = localStorage.getItem("loggedInTrainee");
if (!userStr) {
    window.location.href = "trainee-login.html";
} else {
    showToast("Welcome back!", "success");
}

const user = JSON.parse(userStr);

// Uppercase/Lowercase handle karne ke liye
const data = {};
for (let key in user) {
    data[key.toLowerCase()] = user[key];
}

document.getElementById("tName").textContent = data.name || "N/A";
document.getElementById("tId").textContent = `Year: ${data.yyyy || "N/A"} / Roll: ${data.roll_no || "N/A"}`;
document.getElementById("tCollege").textContent = data.college || "N/A";
document.getElementById("tProject").textContent = data.project_title || "Not Assigned";
document.getElementById("tFrom").textContent = data.from_dt ? new Date(data.from_dt).toLocaleDateString() : "N/A";
document.getElementById("tTo").textContent = data.to_dt ? new Date(data.to_dt).toLocaleDateString() : "N/A";

const statusEl = document.getElementById("tStatus");
const statusValue = data.status || "Pending";
statusEl.textContent = statusValue;
statusEl.className = "status-badge " + (statusValue === "Approved" ? "status-approved" : "status-pending");

// Attendance aur Guide Name set karo
document.getElementById("tAttendance").textContent = data.attendance || "Not updated";
document.getElementById("tGuide").textContent = data.guide_name || "Not Assigned";

// Progress Bar (abhi ke liye 0% hi rahega)
const progressValue = parseInt(data.progress) || 0;
setTimeout(() => {
    const bar = document.getElementById("progressBar");
    if(bar) bar.style.width = progressValue + "%";
}, 500);