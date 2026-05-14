
import torch
import torchvision.io as io
import os

def test_read_video():
    print("Testing torchvision.io.read_video...")
    try:
        # Check if we can even import it without error
        print(f"Torchvision version: {io.__version__ if hasattr(io, '__version__') else 'unknown'}")
        
        # Try to read a non-existent file just to see the error type
        # Or better, just check for 'av'
        import importlib.util
        if importlib.util.find_spec("av") is None:
            print("CRITICAL: 'av' package is NOT installed. torchvision.io.read_video WILL fail.")
        else:
            print("'av' package is installed.")
            
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    test_read_video()
