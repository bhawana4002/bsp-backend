from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import database
import models
import random

app = FastAPI()

# CORS Setup (Taaki frontend backend se baat kar sake)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# 1. TRAINEE REGISTRATION
# ==========================
@app.post("/api/register")
def register_trainee(data: models.TraineeRegister):
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
    
    cursor = conn.cursor()

    # Check karo ki phone ya email pehle se toh nahi hai
    cursor.execute("SELECT * FROM trainees WHERE phone = :1 OR email = :2", (data.phoneNumber, data.email))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Phone or Email already registered!")

    # Naya Trainee ID generate karo (e.g., BSP1234)
    new_id = "BSP" + str(random.randint(1000, 9999))

    # Database mein insert karo
    cursor.execute('''
        INSERT INTO trainees (id, name, roll_number, phone, semester, email, password)
        VALUES (:1, :2, :3, :4, :5, :6, :7)
    ''', (new_id, data.fullName, data.rollNumber, data.phoneNumber, data.semester, data.email, data.password))
    
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Registration Successful!", "trainee_id": new_id}


# ==========================
# 2. TRAINEE LOGIN
# ==========================
@app.post("/api/login/trainee")
def login_trainee(data: models.TraineeLogin):
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
        
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM trainees WHERE id = :1 AND password = :2", (data.id, data.password))
    user = cursor.fetchone()
    
    if user:
        # Oracle row ko dictionary mein convert karna
        columns = [col[0] for col in cursor.description]
        user_dict = dict(zip(columns, user))
        cursor.close()
        conn.close()
        return {"message": "Login Successful", "user": user_dict}
    else:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid Trainee ID or Password")


# ==========================
# 3. ADMIN LOGIN
# ==========================
@app.post("/api/login/admin")
def login_admin(data: models.AdminLogin):
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
        
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM admins WHERE username = :1 AND password = :2", (data.adminId, data.password))
    admin = cursor.fetchone()
    cursor.close()
    conn.close()

    if admin:
        return {"message": "Admin Login Successful", "role": "admin"}
    else:
        raise HTTPException(status_code=401, detail="Invalid Admin Credentials")
# ==========================
# 4. GET ALL TRAINEES (For Admin)
# ==========================
@app.get("/api/trainees")
def get_all_trainees():
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
        
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, roll_number, phone, semester, email, status, attendance, tasks, project, progress FROM trainees")
    trainees = cursor.fetchall()
    
    # Column names nikaalo (Oracle se UPPERCASE aate hain, unhe lowercase karo)
    columns = [col[0].lower() for col in cursor.description] 
    
    # List of dicts banao (ab keys lowercase hongi)
    trainee_list = [dict(zip(columns, row)) for row in trainees]
    
    cursor.close()
    conn.close()
    
    return trainee_list

# ==========================
# 5. UPDATE WORK (For Admin)
# ==========================
@app.put("/api/trainees/{trainee_id}/work")
def update_work(trainee_id: str, data: models.WorkUpdate):
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
        
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE trainees 
        SET attendance = :1, tasks = :2, project = :3, progress = :4
        WHERE id = :5
    ''', (data.attendance, data.tasks, data.project, data.progress, trainee_id))
    
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Work Updated Successfully"}

# ==========================
# 6. UPDATE STATUS (For Admin)
# ==========================
@app.put("/api/trainees/{trainee_id}/status")
def update_status(trainee_id: str):
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
        
    cursor = conn.cursor()
    
    # Pehle current status dekho
    cursor.execute("SELECT status FROM trainees WHERE id = :1", (trainee_id,))
    row = cursor.fetchone()
    if not row:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Trainee not found")
        
    current_status = row[0]
    new_status = "Pending" if current_status == "Approved" else "Approved"
    
    cursor.execute("UPDATE trainees SET status = :1 WHERE id = :2", (new_status, trainee_id))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Status updated to {new_status}"}

# ==========================
# 7. DELETE TRAINEE (For Admin)
# ==========================
@app.delete("/api/trainees/{trainee_id}")
def delete_trainee(trainee_id: str):
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
        
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM trainees WHERE id = :1", (trainee_id,))
    conn.commit()
    cursor.close()
    conn.close()
    
    return {"message": "Trainee deleted successfully"}

# ==========================
# 8. ADD TRAINEE (From Admin Dashboard)
# ==========================
@app.post("/api/admin/add-trainee")
def admin_add_trainee(data: models.TraineeRegister):
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
        
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM trainees WHERE phone = :1 OR email = :2", (data.phoneNumber, data.email))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Phone or Email already registered!")

    new_id = "BSP" + str(random.randint(1000, 9999))

    cursor.execute('''
        INSERT INTO trainees (id, name, roll_number, phone, semester, email, password)
        VALUES (:1, :2, :3, :4, :5, :6, :7)
    ''', (new_id, data.fullName, data.rollNumber, data.phoneNumber, data.semester, data.email, data.password))
    
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Trainee Added!", "trainee_id": new_id}