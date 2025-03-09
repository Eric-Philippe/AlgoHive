import argparse
import sys
from alghive import Alghive

sys.dont_write_bytecode = True

def main():
    parser = argparse.ArgumentParser(description="Zip a folder with .alghive extension.")
    parser.add_argument('--test', action='store_true', help='Run the tests')
    parser.add_argument('--test-count', type=int, default=1000, help='Number of tests to run')
    parser.add_argument('folder', type=str, help='The folder to zip')

    args = parser.parse_args()
    alghive = Alghive(args.folder)
    alghive.check_integrity()
            
    if args.test:
        alghive.run_tests(args.test_count)
        
    alghive.zip_folder()

if __name__ == "__main__":
    main()