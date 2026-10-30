from pydantic import BaseModel
from typing import Optional
from datetime import date

class TraineeRegister(BaseModel):
    yyyy: int
    rollNumber: str
    name: str
    college: str
    address: Optional[str] = None
    fromDate: date
    toDate: date
    section: Optional[str] = None
    deptTrgEnggPlno: Optional[int] = None
    deptTrgEnggName: Optional[str] = None
    deptTrgEnggDesig: Optional[str] = None
    guidePlno: Optional[int] = None
    guideName: Optional[str] = None
    guideDesig: Optional[str] = None
    projectTitle: Optional[str] = None
    remarks: Optional[str] = None
    password: str
    insBy: int = 1001

class TraineeLogin(BaseModel):
    yyyy: int
    rollNumber: str
    password: str

class AdminLogin(BaseModel):
    plno: int
    password: str

class AttendanceUpdate(BaseModel):
    yyyy: int
    rollNumber: str
    attDate: date
    status: str
    remarks: Optional[str] = None

class WorkUpdate(BaseModel):
    projectTitle: str
    remarks: str