from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import database
import models
from datetime import date

app = FastAPI()

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. ADMIN LOGIN
@app.post("/api/login/admin")
def login_admin(data: models.AdminLogin):
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_master WHERE plno = :1 AND pwd = :2", (data.plno, data.password))
    admin = cursor.fetchone()
    cursor.close()
    conn.close()
    if admin:
        return {"message": "Admin Login Successful", "role": "admin", "plno": data.plno}
    else:
        raise HTTPException(status_code=401, detail="Invalid Admin Credentials")

# 2. TRAINEE REGISTRATION
@app.post("/api/register")
def register_trainee(data: models.TraineeRegister):
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
    
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM trainee_master WHERE yyyy = :1 AND roll_no = :2", (data.yyyy, data.rollNumber))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Trainee already exists!")

    # Trainee insert
    cursor.execute('''
        INSERT INTO trainee_master (
            yyyy, roll_no, name, college, address, from_dt, to_dt, section, 
            dept_trg_engg_plno, dept_trg_engg_name, dept_trg_engg_desig, 
            guide_plno, guide_name, guide_desig, project_title, remarks, ins_by
        ) VALUES (
            :1, :2, :3, :4, :5, :6, :7, :8, 
            :9, :10, :11, 
            :12, :13, :14, :15, :16, :17
        )
    ''', (
        data.yyyy, data.rollNumber, data.name, data.college, data.address, 
        data.fromDate, data.toDate, data.section,
        data.deptTrgEnggPlno, data.deptTrgEnggName, data.deptTrgEnggDesig,
        data.guidePlno, data.guideName, data.guideDesig, data.projectTitle, data.remarks, data.insBy
    ))
    
    # Password save in trainee_login
    cursor.execute('''
        INSERT INTO trainee_login (yyyy, roll_no, pwd) VALUES (:1, :2, :3)
    ''', (data.yyyy, data.rollNumber, data.password))
    
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Registration Successful!", "trainee_id": f"{data.yyyy}/{data.rollNumber}"}

# 3. GET ALL TRAINEES
@app.get("/api/trainees")
def get_all_trainees():
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
    cursor = conn.cursor()
    cursor.execute("SELECT yyyy, roll_no, name, college, section, project_title, from_dt, to_dt, status FROM trainee_master")
    trainees = cursor.fetchall()
    columns = [col[0].lower() for col in cursor.description] 
    trainee_list = [dict(zip(columns, row)) for row in trainees]
    cursor.close()
    conn.close()
    return trainee_list

# 4. TRAINEE LOGIN (Attendance ke saath)
@app.post("/api/login/trainee")
def login_trainee(data: models.TraineeLogin):
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM trainee_login WHERE yyyy = :1 AND roll_no = :2 AND pwd = :3", (data.yyyy, data.rollNumber, data.password))
    user = cursor.fetchone()
    if user:
        # Trainee ki details nikaalo
        cursor.execute("SELECT * FROM trainee_master WHERE yyyy = :1 AND roll_no = :2", (data.yyyy, data.rollNumber))
        trainee = cursor.fetchone()
        columns = [col[0].lower() for col in cursor.description]
        trainee_dict = dict(zip(columns, trainee))
        
        # Attendance ka summary nikaalo
        cursor.execute('''
            SELECT 
                COUNT(att_date) as total_marked,
                SUM(CASE WHEN status = 'P' THEN 1 ELSE 0 END) as present_count
            FROM attendance_master 
            WHERE yyyy = :1 AND roll_no = :2
        ''', (data.yyyy, data.rollNumber))
        att_row = cursor.fetchone()
        
        # Dictionary mein attendance add karo
        trainee_dict["attendance"] = f"{att_row[1] or 0} Present / {att_row[0] or 0} Total"
        
        cursor.close()
        conn.close()
        return {"message": "Login Successful", "user": trainee_dict}
    else:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid Year, Roll No or Password")

# 5. UPDATE STATUS (Query Parameter)
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

# 6. DELETE TRAINEE (Query Parameter)
@app.delete("/api/delete/trainee")
def delete_trainee(yyyy: int, roll_no: str):
    conn = database.get_db_connection()
    if not conn: 
        raise HTTPException(status_code=500, detail="DB failed!")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM trainee_login WHERE yyyy = :1 AND roll_no = :2", (yyyy, roll_no))
    cursor.execute("DELETE FROM trainee_master WHERE yyyy = :1 AND roll_no = :2", (yyyy, roll_no))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Trainee deleted successfully"}

# 7. ATTENDANCE MARK KAREIN
@app.post("/api/attendance")
def mark_attendance(data: models.AttendanceUpdate):
    conn = database.get_db_connection()
    if not conn: 
        raise HTTPException(status_code=500, detail="DB failed!")
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO attendance_master (yyyy, roll_no, att_date, status, remarks)
            VALUES (:1, :2, :3, :4, :5)
        ''', (data.yyyy, data.rollNumber, data.attDate, data.status, data.remarks))
        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Attendance already marked!")
    cursor.close()
    conn.close()
    return {"message": "Attendance Marked Successfully"}

# 8. GET ATTENDANCE REPORT (For Admin)
@app.get("/api/attendance/report")
def get_attendance_report():
    conn = database.get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed!")
    cursor = conn.cursor()
    try:
        cursor.execute('''
            SELECT t.yyyy, t.roll_no, t.name, 
                   COUNT(a.att_date) as total_marked,
                   SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) as present_count,
                   SUM(CASE WHEN a.status = 'A' THEN 1 ELSE 0 END) as absent_count
            FROM trainee_master t
            LEFT JOIN attendance_master a ON t.yyyy = a.yyyy AND t.roll_no = a.roll_no
            GROUP BY t.yyyy, t.roll_no, t.name
            ORDER BY t.yyyy, t.roll_no
        ''')
        rows = cursor.fetchall()
        columns = [col[0].lower() for col in cursor.description]
        report = [dict(zip(columns, row)) for row in rows]
        return report
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()