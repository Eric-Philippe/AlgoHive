import os
import zipfile
import importlib.util
import sys

from coreprops import CoreProps

class Alghive:
    EXTENSION = '.alghive'
    EXECUTABLES_REQUIRED = ["forge.py", "decrypt.py", "unveil.py"]
    PROMPTS_REQUIRED = ["cipher.html", "obscure.html"]
    PROPS_FOLDER = "props"
    AUTHORIZED_ELEMENTS = ["__pycache__", "core.xml"]
    
    def __init__(self, folder_name):
        if not os.path.isdir(folder_name):
            raise ValueError(f"The folder '{folder_name}' does not exist.")
        
        self.folder_name = folder_name.rstrip("/")
        self.zip_file_name = f"{folder_name}{self.EXTENSION}"
        
    def run(self):
        self.check_integrity()
        self.zip_folder()
        
    def check_integrity(self):
        # If one of the checks fails, raise an exception
        if not self.check_files():
            raise ValueError(f"Folder '{self.folder_name}' does not respect the file constraints.")
        
        if not self.check_forge():
            raise ValueError(f"Folder '{self.folder_name}' does not respect the forge constraints.")
        
        if not self.check_decrypt():
            raise ValueError(f"Folder '{self.folder_name}' does not respect the decrypt constraints.")
        
        if not self.check_unveil():
            raise ValueError(f"Folder '{self.folder_name}' does not respect the unveil constraints.")
        
        if not self.check_html():
            raise ValueError(f"Folder '{self.folder_name}' does not respect the html constraints.")
        
        try:
            self.generate_props()
        except ValueError as e:
            raise ValueError(f"Folder '{self.folder_name}' does not respect the core constraints: {e}")
        
        
    def check_files(self):        
        # Check if all required files are present
        FILES_REQUIRED = self.EXECUTABLES_REQUIRED + self.PROMPTS_REQUIRED
        for file in FILES_REQUIRED:
            if not os.path.isfile(os.path.join(self.folder_name, file)):
                print(f"File '{file}' is missing in the folder '{self.folder_name}'.")
                return False
        
        return True
    
    """
    The file forge.py must respect the following constraints:
    - It must be a class named Forge
    - It must have a method __init__(self, lines_count: int, unique_id: str = None)
    - It must have a method run(self) -> list
    - It must have a method generate_line(self, index: int) -> str
    - All those methods must be implemented
    - The file must be executable
    """
    def check_forge(self):
        try:
            forge = self.load_module("forge")
        except ImportError:
            print(f"File 'forge.py' is not importable.")
            return False
        
        if not hasattr(forge, "Forge"):
            print(f"File 'forge.py' does not contain a class named 'Forge'.")
            return False
        
        forge = forge.Forge(1)
        if not hasattr(forge, "__init__") or not hasattr(forge, "run") or not hasattr(forge, "generate_line"):
            print(f"File 'forge.py' does not contain all required methods.")
            return False
        
        return True
    
    """
    The file decrypt.py must respect the following constraints:
    - It must be a class named Decrypt
    - It must have a method __init__(self, lines: list)
    - It must have a method run(self) -> int
    - All those methods must be implemented
    - The file must be executable
    """
    def check_decrypt(self):
        try:
            decrypt = self.load_module("decrypt")
        except ImportError:
            print(f"File 'decrypt.py' is not importable.")
            return False
        
        if not hasattr(decrypt, "Decrypt"):
            print(f"File 'decrypt.py' does not contain a class named 'Decrypt'.")
            return False
        
        decrypt = decrypt.Decrypt([1])
        if not hasattr(decrypt, "__init__") or not hasattr(decrypt, "run"):
            print(f"File 'decrypt.py' does not contain all required methods.")
            return False
        
        return True
    
    """
    The file unveil.py must respect the following constraints:
    - It must be a class named Unveil
    - It must have a method __init__(self, lines: list)
    - It must have a method run(self) -> int
    - All those methods must be implemented
    - The file must be executable
    """
    def check_unveil(self):
        try:
            unveil = self.load_module("unveil")
        except ImportError:
            print(f"File 'unveil.py' is not importable.")
            return False
        
        if not hasattr(unveil, "Unveil"):
            print(f"File 'unveil.py' does not contain a class named 'Unveil'.")
            return False
        
        unveil = unveil.Unveil([1])
        if not hasattr(unveil, "__init__") or not hasattr(unveil, "run"):
            print(f"File 'unveil.py' does not contain all required methods.")
            return False
        
        return True
    
    """
    Check HTML files, they must respect the following constraints:
    - The first and last html tag must be <article>
    """
    def check_html(self):
        for file in self.PROMPTS_REQUIRED:
            with open(os.path.join(self.folder_name, file)) as f:
                content = f.read()
                content = content.replace(" ", "").replace("\n", "")
                if not content.startswith("<article>") or not content.endswith("</article>"):
                    print(f"File '{file}' does not start and end with <article> tag.")
                    return False
        
        return True
    
    def load_module(self, file_name):
        spec = importlib.util.spec_from_file_location(file_name, os.path.join(self.folder_name, file_name + ".py"))
        module = importlib.util.module_from_spec(spec)
        sys.modules[file_name] = module
        spec.loader.exec_module(module)
        return module
        
    def zip_folder(self):
        # Create the zip file name with .alghive extension
        file_name = self.folder_name.split("/")[-1]
        zip_file_name = f"{file_name}{self.EXTENSION}"

        # Create a zip file with .alghive extension
        with zipfile.ZipFile(zip_file_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(self.folder_name):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, start=self.folder_name)
                    zipf.write(file_path, arcname)

        print(f"Folder '{self.folder_name}' has been zipped as '{zip_file_name}'.")
                    
        
    def generate_props(self):
        # Ensure the props folder exists
        if not os.path.isdir(f"{self.folder_name}/{self.PROPS_FOLDER}"):
            os.mkdir(f"{self.folder_name}/{self.PROPS_FOLDER}")
        
        core_props = CoreProps(self.folder_name)
        core_props.check_file_integrity()


            
        
        
        