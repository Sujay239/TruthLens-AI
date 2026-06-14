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


def add_column(cursor, table: str, column_sql: str):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column_sql};")
        print(f"Added {table}.{column_sql.split()[0]}")
    except pymysql.err.OperationalError as exc:
        if exc.args[0] == 1060:
            print(f"{table}.{column_sql.split()[0]} already exists")
        else:
            raise


def create_index(cursor, index_name: str, table: str, column: str):
    try:
        cursor.execute(f"CREATE INDEX {index_name} ON {table}({column});")
        print(f"Added index {index_name}")
    except pymysql.err.OperationalError as exc:
        if exc.args[0] == 1061:
            print(f"Index {index_name} already exists")
        else:
            raise


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
            add_column(cursor, "analysis_logs", "scan_type VARCHAR(50) NULL")
            add_column(cursor, "analysis_logs", "scan_id INT NULL")
            create_index(cursor, "idx_analysis_logs_scan_type", "analysis_logs", "scan_type")
            create_index(cursor, "idx_analysis_logs_scan_id", "analysis_logs", "scan_id")

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS scan_feedback (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    analysis_log_id INT NOT NULL,
                    scan_type VARCHAR(50) NOT NULL,
                    scan_id INT NOT NULL,
                    rating VARCHAR(20) NOT NULL,
                    message TEXT NULL,
                    corrected_label VARCHAR(50) NULL,
                    model_processed BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_scan_feedback_user_id (user_id),
                    INDEX idx_scan_feedback_analysis_log_id (analysis_log_id),
                    INDEX idx_scan_feedback_scan_type (scan_type),
                    INDEX idx_scan_feedback_scan_id (scan_id),
                    CONSTRAINT fk_scan_feedback_user FOREIGN KEY (user_id) REFERENCES users(id),
                    CONSTRAINT fk_scan_feedback_analysis_log FOREIGN KEY (analysis_log_id) REFERENCES analysis_logs(id)
                );
                """
            )
            print("Ensured scan_feedback table")

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS feedback_learning_stats (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    scan_type VARCHAR(50) NOT NULL,
                    predicted_label VARCHAR(50) NOT NULL,
                    likes INT DEFAULT 0,
                    dislikes INT DEFAULT 0,
                    correction_label VARCHAR(50) NULL,
                    correction_count INT DEFAULT 0,
                    confidence_adjustment FLOAT DEFAULT 0,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_feedback_learning_scan_type (scan_type),
                    INDEX idx_feedback_learning_predicted_label (predicted_label)
                );
                """
            )
            print("Ensured feedback_learning_stats table")

        connection.commit()
        print("Feedback schema update complete")
    finally:
        connection.close()


if __name__ == "__main__":
    main()
