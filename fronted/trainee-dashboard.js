// 1. Login Check
const userStr = localStorage.getItem("loggedInTrainee");
if (!userStr) {
    window.location.href = "trainee-login.html";
} else {
    showToast("Welcome back!", "success");
}

// 2. Data Parse karo
const user = JSON.parse(userStr);

// --- SABSE BADI FIX: Uppercase/Lowercase handle karne ke liye ---
// Agar data Oracle se UPPERCASE me aaya hai, toh use lowercase me convert karo
const data = {};
for (let key in user) {
    data[key.toLowerCase()] = user[key];
}
// -----------------------------------------------------------------

// 3. Privacy Masking Functions
const maskPhone = (p) => p ? p.substring(0, 2) + "******" + p.substring(p.length - 2) : "N/A";
const maskEmail = (e) => {
    if(!e) return "N/A";
    let parts = e.split("@");
    return parts[0].substring(0, 3) + "***@" + parts[1];
};

// 4. Profile Data Set karo (Ab 'data' use kar rahe hain, 'user' nahi)
document.getElementById("tName").textContent = data.name || "N/A";
document.getElementById("tId").textContent = "ID: " + (data.id || "N/A");
document.getElementById("tRoll").textContent = data.roll_number || "N/A";
document.getElementById("tSem").textContent = data.semester || "N/A";
document.getElementById("tPhone").textContent = maskPhone(data.phone); 
document.getElementById("tEmail").textContent = maskEmail(data.email);

// 5. Status Badge Update
const statusEl = document.getElementById("tStatus");
const statusValue = data.status || "Pending";
statusEl.textContent = statusValue;
statusEl.className = "status-badge " + (statusValue === "Approved" ? "status-approved" : "status-pending");

// 6. Work Data Set karo
document.getElementById("tAttendance").textContent = data.attendance || "Not updated yet";
document.getElementById("tTasks").textContent = data.tasks || "Not updated yet";
document.getElementById("tProject").textContent = data.project || "Not assigned yet";
document.getElementById("tProgress").textContent = data.progress || "0%";

// 7. Progress Bar Animation
const progressValue = parseInt(data.progress) || 0;
setTimeout(() => {
    const bar = document.getElementById("progressBar");
    if(bar) bar.style.width = progressValue + "%";
}, 500);