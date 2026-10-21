from pydantic import BaseModel

# Trainee Register karne ke liye data model
class TraineeRegister(BaseModel):
    fullName: str
    rollNumber: str
    phoneNumber: str
    semester: str
    email: str
    password: str

# Trainee Login ke liye
class TraineeLogin(BaseModel):
    id: str
    password: str

# Admin Login ke liye
class AdminLogin(BaseModel):
    adminId: str
    password: str

# Work Update ke liye (Admin karega)
class WorkUpdate(BaseModel):
    attendance: str
    tasks: str
    project: str
    progress: str