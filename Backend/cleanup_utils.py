import shutil
import os

def cleanup():
    target = os.path.join('app', 'utils')
    if os.path.isdir(target):
        print(f"Found directory: {target}")
        try:
            # Try to rename first (safer)
            new_name = os.path.join('app', 'news_utils_backup')
            if os.path.exists(new_name):
                shutil.rmtree(new_name)
            os.rename(target, new_name)
            print(f"✅ Successfully renamed {target} to {new_name}")
        except Exception as e:
            print(f"❌ Failed to rename: {e}")
            try:
                # Try to remove directly
                shutil.rmtree(target)
                print(f"✅ Successfully removed {target}")
            except Exception as e2:
                print(f"❌ Failed to remove: {e2}")
    else:
        print(f"Directory not found: {target}")

if __name__ == "__main__":
    cleanup()
