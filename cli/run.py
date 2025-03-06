import argparse
import os
import zipfile

def zip_folder(folder_name):
    # Ensure the folder exists
    if not os.path.isdir(folder_name):
        print(f"The folder '{folder_name}' does not exist.")
        return

    # Create the zip file name with .alghive extension
    zip_file_name = f"{folder_name}.alghive"

    # Create a zip file with .alghive extension
    with zipfile.ZipFile(zip_file_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_name):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, start=folder_name)
                zipf.write(file_path, arcname)

    print(f"Folder '{folder_name}' has been zipped as '{zip_file_name}'.")

def main():
    parser = argparse.ArgumentParser(description="Zip a folder with .alghive extension.")
    parser.add_argument('folder', type=str, help='The folder to zip')

    args = parser.parse_args()
    zip_folder(args.folder)

if __name__ == "__main__":
    main()