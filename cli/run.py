import argparse
import sys
from alghive import Alghive

sys.dont_write_bytecode = True

def main():
    parser = argparse.ArgumentParser(description="Zip a folder with .alghive extension.")
    parser.add_argument('folder', type=str, help='The folder to zip')

    args = parser.parse_args()
    alghive = Alghive(args.folder)
    
    alghive.run()

if __name__ == "__main__":
    main()