if (localStorage.getItem("loggedInAdmin") !== "true") {
    window.location.href = "admin-login.html";
} else {
    showToast("Logged in successfully as Admin!", "success"); 
}

function maskPhone(phone) {
    if (!phone || phone.length < 10) return "N/A";
    return phone.substring(0, 4) + "***" + phone.substring(phone.length - 3);
}

async function fetchTrainees() {
    const tbody = document.getElementById("traineeTableBody");
    tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Loading data from server...</td></tr>";

    try {
        const response = await fetch("http://127.0.0.1:8000/api/trainees");
        const trainees = await response.json();
        tbody.innerHTML = ""; 
        
        // Stats Calculation
        let total = trainees.length;
        let approved = trainees.filter(t => t.status === 'Approved').length;
        let pending = total - approved;

        document.getElementById("statTotal").innerText = total;
        document.getElementById("statApproved").innerText = approved;
        document.getElementById("statPending").innerText = pending;

        if(total === 0) {
            tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No trainees found.</td></tr>";
            return;
        }

        trainees.forEach((t) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight:600; color:#f39c12;">${t.id}</td>
                <td>${t.name}</td>
                <td>${t.roll_number}</td>
                <td>${maskPhone(t.phone)}</td>
                <td><span class="status-badge ${t.status === 'Approved' ? 'status-approved' : 'status-pending'}">${t.status}</span></td>
                <td>
                    <button class="action-btn btn-edit" onclick="toggleStatus('${t.id}')">Status</button>
                    <button class="action-btn" style="background:#9b59b6; color:white;" onclick="updateWork('${t.id}')">Update Work</button>
                    <button class="action-btn btn-delete" onclick="deleteTrainee('${t.id}')">Delete</button>
                </td>`;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:red;'>Error connecting to backend!</td></tr>";
        showToast("Failed to load data!", "error");
    }
}

// Naya Trainee Add
document.getElementById("addBtn").addEventListener("click", async () => {
    const name = document.getElementById("newName").value.trim();
    const roll = document.getElementById("newRoll").value.trim();
    const phone = document.getElementById("newPhone").value.trim();
    const pass = document.getElementById("newPass").value.trim();

    if (!name || !roll || !phone || !pass) return showToast("Please fill all fields!", "error");
    if (phone.length !== 10) return showToast("Phone must be 10 digits!", "error");

    const formData = { fullName: name, rollNumber: roll, phoneNumber: phone, semester: "Semester 1", email: `${roll}@bsp.com`, password: pass };

    try {
        const response = await fetch("http://127.0.0.1:8000/api/admin/add-trainee", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok) {
            showToast(`Trainee Added! ID: ${data.trainee_id}`, "success");
            document.getElementById("newName").value = ""; document.getElementById("newRoll").value = "";
            document.getElementById("newPhone").value = ""; document.getElementById("newPass").value = "";
            fetchTrainees(); 
        } else { showToast(data.detail || "Failed to add!", "error"); }
    } catch (error) { showToast("Server Error!", "error"); }
});

// Status Toggle
async function toggleStatus(id) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/trainees/${id}/status`, { method: "PUT" });
        if (response.ok) { showToast("Status Updated!", "success"); fetchTrainees(); }
    } catch (error) { showToast("Server Error!", "error"); }
}

// Work Update
async function updateWork(id) {
    const att = prompt("Enter Attendance (e.g. 18/20):"); if (att === null) return;
    const tsk = prompt("Enter Tasks (e.g. 5/8):"); if (tsk === null) return;
    const prj = prompt("Enter Project Name:"); if (prj === null) return;
    const prg = prompt("Enter Progress (e.g. 75%):"); if (prg === null) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/trainees/${id}/work`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attendance: att, tasks: tsk, project: prj, progress: prg })
        });
        if (response.ok) { showToast("Work Updated!", "success"); fetchTrainees(); }
    } catch (error) { showToast("Server Error!", "error"); }
}

// Delete Trainee
async function deleteTrainee(id) {
    if (!confirm("Are you sure?")) return;
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/trainees/${id}`, { method: "DELETE" });
        if (response.ok) { showToast("Trainee Deleted!", "success"); fetchTrainees(); }
    } catch (error) { showToast("Server Error!", "error"); }
}

// Page load hote hi list fetch karo
fetchTrainees();