
import sqlite3

def check_video_scans_schema():
    conn = sqlite3.connect('truthlens.db')
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA table_info(video_scans)")
        columns = cursor.fetchall()
        print("Columns in video_scans table:")
        for col in columns:
            print(f"- {col[1]} ({col[2]})")
            
        # Check if video_hash exists
        column_names = [col[1] for col in columns]
        if 'video_hash' in column_names:
            print("\nSUCCESS: video_hash column exists.")
        else:
            print("\nFAILURE: video_hash column is MISSING.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_video_scans_schema()
