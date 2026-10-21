# Oracle Connection Details
import oracledb
import os

# Oracle Connection Details
DB_USER = "system"
DB_PASSWORD = "admin123"    # <--- Yahan admin123 hona chahiye
DB_DSN = os.getenv("DB_DSN", "localhost:1521/XEPDB1")

def get_db_connection():
    try:
        conn = oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN)
        return conn
    except Exception as e:
        print("Oracle Connection Error:", e)
        return None

# Baaki code waisa hi rahega...
def get_db_connection():
    try:
        # Oracle se connect karo
        conn = oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN)
        return conn
    except Exception as e:
        print("Oracle Connection Error:", e)
        return None

def init_db():
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    try:
        # 1. Admins Table Create karo
        cursor.execute('''
            BEGIN
                EXECUTE IMMEDIATE 'CREATE TABLE admins (
                    username VARCHAR2(50) PRIMARY KEY,
                    password VARCHAR2(100) NOT NULL
                )';
            EXCEPTION WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
            END;
        ''')
        
        # 2. Trainees Table Create karo
        cursor.execute('''
            BEGIN
                EXECUTE IMMEDIATE 'CREATE TABLE trainees (
                    id VARCHAR2(20) PRIMARY KEY,
                    name VARCHAR2(100) NOT NULL,
                    roll_number VARCHAR2(50) UNIQUE NOT NULL,
                    phone VARCHAR2(15) UNIQUE NOT NULL,
                    semester VARCHAR2(50) NOT NULL,
                    email VARCHAR2(100) UNIQUE NOT NULL,
                    password VARCHAR2(100) NOT NULL,
                    status VARCHAR2(20) DEFAULT ''Pending'',
                    attendance VARCHAR2(20) DEFAULT ''0/0'',
                    tasks VARCHAR2(20) DEFAULT ''0/0'',
                    project VARCHAR2(100) DEFAULT ''Not Assigned'',
                    progress VARCHAR2(20) DEFAULT ''0%''
                )';
            EXCEPTION WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
            END;
        ''')

        # Default Admin Add karo
        cursor.execute("SELECT * FROM admins WHERE username = 'admin123'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO admins (username, password) VALUES ('admin123', 'steel@2025')")
        
        conn.commit()
        print("Oracle Database aur Tables ready hain!")
        
    except Exception as e:
        print("Error creating tables:", e)
    finally:
        cursor.close()
        conn.close()

# Initialize
init_db()