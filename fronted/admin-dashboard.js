if (localStorage.getItem("loggedInAdmin") !== "true") {
    window.location.href = "admin-login.html";
} else {
    showToast("Logged in successfully as Admin!", "success"); 
}

const backendURL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
    ? "http://127.0.0.1:8000" : "https://bsp-backend-phwb.onrender.com";

async function fetchTrainees() {
    const tbody = document.getElementById("traineeTableBody");
    tbody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Loading...</td></tr>";
    try {
        const response = await fetch(`${backendURL}/api/trainees`);
        const trainees = await response.json();
        tbody.innerHTML = ""; 
        if(trainees.length === 0) {
            tbody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>No trainees found.</td></tr>";
            return;
        }
        trainees.forEach((t) => {
            const yyyy = t.yyyy || t.YYYY;
            const roll_no = t.roll_no || t.ROLL_NO;
            const name = t.name || t.NAME;
            const college = t.college || t.COLLEGE;
            const project = t.project_title || t.PROJECT_TITLE || "N/A";
            const status = t.status || t.STATUS || "Pending";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight:600; color:#f39c12;">${yyyy}</td>
                <td>${roll_no}</td>
                <td>${name}</td>
                <td>${college}</td>
                <td>${project}</td>
                <td><span class="status-badge ${status === 'Approved' ? 'status-approved' : 'status-pending'}">${status}</span></td>
                <td>
                    <button class="action-btn btn-edit" onclick="toggleStatus('${yyyy}', '${roll_no}')">Status</button>
                    <button class="action-btn btn-delete" onclick="deleteTrainee('${yyyy}', '${roll_no}')">Delete</button>
                </td>`;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = "<tr><td colspan='7' style='text-align:center; color:red;'>Error!</td></tr>";
    }
}

async function toggleStatus(yyyy, rollNo) {
    try {
        // URL query parameter use kar rahe hain (slash problem fix)
        const response = await fetch(`${backendURL}/api/status/update?yyyy=${yyyy}&roll_no=${encodeURIComponent(rollNo)}`, { method: "PUT" });
        if (response.ok) { 
            showToast("Status Updated!", "success"); 
            fetchTrainees(); 
        } else { 
            const errorData = await response.json();
            showToast(errorData.detail || "Error updating status!", "error"); 
        }
    } catch (error) { 
        showToast("Server Error!", "error"); 
    }
}

async function deleteTrainee(yyyy, rollNo) {
    if (!confirm("Are you sure you want to delete this trainee?")) return;
    try {
        // Delete bhi query parameter se
        const response = await fetch(`${backendURL}/api/delete/trainee?yyyy=${yyyy}&roll_no=${encodeURIComponent(rollNo)}`, { method: "DELETE" });
        if (response.ok) { 
            showToast("Trainee Deleted!", "success"); 
            fetchTrainees(); 
        }
    } catch (error) { 
        showToast("Server Error!", "error"); 
    }
}

fetchTrainees();