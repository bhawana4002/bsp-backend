const backendURL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
    ? "http://127.0.0.1:8000" : "https://bsp-backend-phwb.onrender.com";

// 1. Attendance Mark Karna
document.getElementById("markAttBtn").addEventListener("click", async () => {
    const yyyy = parseInt(document.getElementById("attYear").value);
    const rollNo = document.getElementById("attRollNo").value.trim();
    const attDate = document.getElementById("attDate").value;
    const status = document.getElementById("attStatus").value;

    if (!yyyy || !rollNo || !attDate) {
        return showToast("Please fill all fields!", "error");
    }

    const formData = {
        yyyy: yyyy,
        rollNumber: rollNo,
        attDate: attDate,
        status: status,
        remarks: ""
    };

    try {
        const response = await fetch(`${backendURL}/api/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        const data = await response.json();

        if (response.ok) {
            showToast("Attendance Marked!", "success");
            document.getElementById("attYear").value = "";
            document.getElementById("attRollNo").value = "";
            document.getElementById("attDate").value = "";
            fetchReport(); // Report refresh karo
        } else {
            showToast(data.detail || "Failed!", "error");
        }
    } catch (error) {
        showToast("Server Error!", "error");
    }
});

// 2. Attendance Report Fetch Karna
async function fetchReport() {
    const tbody = document.getElementById("attendanceReportBody");
    tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Loading...</td></tr>";

    try {
        const response = await fetch(`${backendURL}/api/attendance/report`);
        const data = await response.json();

        tbody.innerHTML = "";
        if (data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No data found.</td></tr>";
            return;
        }

        data.forEach((row) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight:600; color:#f39c12;">${row.yyyy}</td>
                <td>${row.roll_no}</td>
                <td>${row.name}</td>
                <td>${row.total_marked || 0}</td>
                <td style="color:#2ecc71; font-weight:bold;">${row.present_count || 0}</td>
                <td style="color:#e74c3c; font-weight:bold;">${row.absent_count || 0}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:red;'>Error loading data!</td></tr>";
    }
}

// Page load hote hi report fetch karo
fetchReport();