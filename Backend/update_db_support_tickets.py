import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/truthlens_db")

def parse_mysql_url(url: str):
    url_str = url.replace("mysql+pymysql://", "")
    user_pass, rest = url_str.split("@")
    if ":" in user_pass:
        user, password = user_pass.split(":", 1)
    else:
        user, password = user_pass, ""

    host_port, dbname = rest.split("/", 1)
    if ":" in host_port:
        host, port = host_port.split(":", 1)
        port = int(port)
    else:
        host, port = host_port, 3306
    return user, password, host, port, dbname

def main():
    user, password, host, port, dbname = parse_mysql_url(db_url)
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        port=port,
        database=dbname,
    )

    try:
        with connection.cursor() as cursor:
            # Add rejection_reason column if it doesn't exist
            try:
                cursor.execute("ALTER TABLE support_tickets ADD COLUMN rejection_reason TEXT AFTER status")
                print("Added rejection_reason column")
            except Exception as e:
                print(f"rejection_reason column might already exist: {e}")

            # Update default status and existing records if needed
            cursor.execute("ALTER TABLE support_tickets MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'")
            print("Updated status default to 'Pending'")
            
            cursor.execute("UPDATE support_tickets SET status = 'Pending' WHERE status = 'Open'")
            print("Migrated 'Open' tickets to 'Pending'")

        connection.commit()
        print("Support tickets migration complete")
    finally:
        connection.close()

if __name__ == "__main__":
    main()
