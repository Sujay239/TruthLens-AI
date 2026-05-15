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
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS admins (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    hashed_password VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255) NULL,
                    avatar VARCHAR(500) NULL,
                    pin VARCHAR(255) NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_admins_username (username),
                    INDEX idx_admins_email (email)
                );
                """
            )
            print("Ensured admins table")

            cursor.execute(
                """
                INSERT INTO admins (
                    username,
                    email,
                    hashed_password,
                    full_name,
                    pin
                )
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    email = VALUES(email),
                    hashed_password = VALUES(hashed_password),
                    full_name = VALUES(full_name),
                    pin = VALUES(pin),
                    updated_at = CURRENT_TIMESTAMP;
                """,
                (
                    "Sujay2008",
                    "sujaykumarkotal8520@gmail.com",
                    "$2a$12$5BeQVvRHWfHEXxc59UtiRuxjNVyxSh8/z8q.CFqtixBjbGZH6SYei",
                    "sujay kumar kotal(Project leader)",
                    "760212",
                ),
            )
            print("Ensured default admin user: Sujay2008")

        connection.commit()
        print("Admins schema update complete")
    finally:
        connection.close()


if __name__ == "__main__":
    main()
