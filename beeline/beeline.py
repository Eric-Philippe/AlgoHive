import os
import argparse
import sys
import shutil
from hivecraft.alghive import Alghive

sys.dont_write_bytecode = True

def create_project(project_name):
    template_dir = os.path.join(os.path.dirname(__file__), 'template')
    project_dir = os.path.join(os.getcwd(), project_name)
    
    shutil.copytree(template_dir, project_dir)
    
    print(f"Project {project_name} created in {project_dir}")
    print()
    print("You can now start working on your puzzle, implement the following methods in the respective classes:")
    print("  - Forge.generate_line() in forge.py")
    print("  - Decrypt.run() in decrypt.py")
    print("  - Unveil.run() in unveil.py")
    print()
    print("Write the puzzle statement in the html files:")
    print("  - cipher.html fir the Part 1")
    print("  - obscure.html for the Part 2")
    print()
    print("> To test your puzzle, run 'beeline test <folder>'")
    print("> To compile your puzzle, run 'beeline compile <folder>'")
    print()
    print(">$ cd " + project_name)
    print(">$ beeline test " + project_name)
    print(">$ beeline compile " + project_name)
    print()
    
def run_tests(folder, test_count: int = 1000):
    print(f"Running tests for {folder}...")
    print()
    
    alghive = Alghive(folder)
    alghive.check_integrity(False)
    alghive.run_tests(test_count)
    
    print()
    print("All tests passed!")
    print()
    print("You can now compile your puzzle by running 'beeline compile " + folder + "'")
    print()
    print(">$ beeline compile " + folder)
    print()
    
def compile(folder, test=False, test_count=1000):
    print(f"Compiling {folder}...")
    print()
    
    alghive = Alghive(folder)
    
    print("Checking integrity...")
    alghive.check_integrity(True)
    
    if test:
        print()
        print("Running tests...")
        print()
        alghive.run_tests(test_count)
        print()
        print("All tests passed!")
        
    print()
    print("Compiling...")
    print()
    alghive.zip_folder()
    print()
    print("Puzzle compiled successfully!")
    print()
    print("You can now upload the `.alghive` file to AlgoHive.")

def main():
    parser = argparse.ArgumentParser(description="CLI for managing AlgoHive puzzles.")
    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Subparser for the 'new' command
    parser_new = subparsers.add_parser('new', help='Create a new puzzle')
    parser_new.add_argument('puzzle_name', type=str, help='The name of the new puzzle')

    # Subparser for the 'test' command
    parser_test = subparsers.add_parser('test', help='Test a puzzle')
    parser_test.add_argument('folder', type=str, help='The folder containing the puzzle to test')
    parser_test.add_argument('--test-count', type=int, default=1000, help='Number of tests to run')

    # Subparser for the 'compile' command
    parser_compile = subparsers.add_parser('compile', help='Compile a puzzle')
    parser_compile.add_argument('folder', type=str, help='The folder containing the puzzle to compile')
    parser_compile.add_argument('--test', action='store_true', help='Run the tests before compiling')
    parser_compile.add_argument('--test-count', type=int, default=1000, help='Number of tests to run')

    args = parser.parse_args()

    if args.command == 'new':
        create_project(args.puzzle_name)
    elif args.command == 'test':
        run_tests(args.folder, args.test_count)
    elif args.command == 'compile':
        compile(args.folder, args.test, args.test_count)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()