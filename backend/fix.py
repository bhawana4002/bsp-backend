import re

# 1. main.py ko update karein (Status API ko query parameter wala banana)
with open('main.py', 'r') as f:
    content = f.read()

# Status update wale function ko naye code se replace karo
old_pattern = r'# 5\. UPDATE STATUS.*?(?=# 6\. DELETE TRAINEE)'
new_code = '''# 5. UPDATE STATUS (Query Parameter ke saath)
@app.put("/api/status/update")
def update_status(yyyy: int, roll_no: str):
    conn = database.get_db_connection()
    if not conn: 
        raise HTTPException(status_code=500, detail="DB failed!")
    
    cursor = conn.cursor()
    cursor.execute("SELECT status FROM trainee_master WHERE yyyy = :1 AND roll_no = :2", (yyyy, roll_no))
    row = cursor.fetchone()
    
    if not row:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Trainee not found")
    
    current_status = str(row[0]).strip() if row[0] else "Pending"
    new_status = "Pending" if current_status.upper() == "APPROVED" else "Approved"
    
    cursor.execute("UPDATE trainee_master SET status = :1 WHERE yyyy = :2 AND roll_no = :3", (new_status, yyyy, roll_no))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Status updated to {new_status}"}

'''
content = re.sub(old_pattern, new_code, content, flags=re.DOTALL)

with open('main.py', 'w') as f:
    f.write(content)
print("✅ main.py update ho gaya!")

# 2. admin-dashboard.js ko update karein (Status function ko naya URL wala banana)
with open('../frontend/admin-dashboard.js', 'r') as f:
    js_content = f.read()

old_js = r'async function toggleStatus.*?(?=async function deleteTrainee)'
new_js = '''async function toggleStatus(yyyy, rollNo) {
    try {
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

'''
js_content = re.sub(old_js, new_js, js_content, flags=re.DOTALL)

with open('../frontend/admin-dashboard.js', 'w') as f:
    f.write(js_content)
print("✅ admin-dashboard.js update ho gaya!")