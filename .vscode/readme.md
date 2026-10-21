Bilkul! Aapko ye saari commands ek jagah save kar leni chahiye, taaki baar-baar yaad karne ki zaroorat na pade. 

Sabse best tarika hai ki aap apne VS Code ke main folder (`BSP_Trainee_System`) mein ek nayi file banayein jiska naam **`README.md`** ya **`Commands.txt`** rakhein. 

Aap usme ye saara data copy-paste kar dein:

---

### 📝 Project Commands Cheat Sheet

#### 1. Project Start Karne Ke Liye (Subah)
```bash
# Step 1: Oracle Database Start Karein
docker start oracle-db

# Step 2: Backend Folder Mein Jayein aur Server Start Karein
cd backend
uvicorn main:app --reload --port 8000
```
*(Note: Frontend ke liye VS Code mein `index.html` par right-click karke "Open with Live Server" dabayein).*

#### 2. Agar Port Already in Use Ka Error Aaye
```bash
kill -9 $(lsof -t -i:8000)
```

#### 3. Database (Oracle) Mein Data Dekhne Ke Liye
```bash
# Step 1: Oracle SQL Prompt Kholein
docker exec -it oracle-db sqlplus system/admin123@localhost:1521/XEPDB1

# Step 2: Table Formatting Set Karein
SET LINESIZE 200;
SET PAGESIZE 100;

# Step 3: Data Dekhein
SELECT * FROM trainees;

# Step 4: Bahar Aane Ke Liye
exit
```

#### 4. Sab Kuch Band Karne Ke Liye (Raat Ko)
```bash
# Step 1: Python Server Band Karein
# (Terminal mein Ctrl + C dabayein)

# Step 2: Oracle Docker Container Band Karein
docker stop oracle-db

# Step 3: Conda Base Deactivate Karein
conda deactivate
```

#### 5. Admin Login Details (Testing Ke Liye)
*   **Admin ID:** `admin123`
*   **Admin Password:** `steel@2025`

---

Aap is file ko save kar lein. Ab jab bhi kuch bhoolen, bas is file ko khol kar dekh lein. 

**Aur haan, kya aapne `main.py` check kiya? Kya abhi bhi login karte waqt 404 error aa raha hai?** Agar haan, toh usko pehle fix karte hain!

Bilkul! Terminal mein tables dekhna bahut aasan hai, bas aapko sahi commands ka pata hona chahiye. 

Ye rahi wo commands jo aap terminal mein use kar sakti hain:

### Step 1: Oracle Database ke Terminal mein Jayein
Apne VS Code ke terminal mein ye command run karein:
```bash
docker exec -it oracle-db sqlplus system/admin123@localhost:1521/XEPDB1
```
Jab `SQL>` ka prompt aa jaye, tab aap andar hain.

### Step 2: Table ko Sundar Format Mein Dekhein
Terminal mein data ko ajeeb tarike se tootne se bachane ke liye, ye 2 commands ek-ek karke run karein:
```sql
SET LINESIZE 200;
SET PAGESIZE 100;
```

### Step 3: Data Dekhein
Ab aap apni table ka data dekh sakti hain:
```sql
SELECT * FROM trainees;
```
*(Agar aapko Admin ki table dekhni ho toh `SELECT * FROM admins;` run karein).*

### Step 4: Table Se Bahar Aayein
Jab aapka kaam ho jaye, toh terminal se bahar aane ke liye ye likhein:
```sql
exit
```

---

### Extra Tip: Agar aapko sirf specific columns dekhne hain
Agar aapko saara data nahi chahiye, balki sirf Naam aur Phone dekhna hai, toh aap aisi query run kar sakti hain:
```sql
SELECT name, phone, status FROM trainees;
```

Aap ye commands apni `Project_Commands.txt` file mein bhi save kar lein taaki baar-baar na dhoondhna pade!