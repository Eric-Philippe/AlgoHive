import os

"""
desc.xml is a file that contains the basic properties related to the puzzle of the Alghive file
<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <difficulty>HARD</difficulty>
    <language>fr</language>
</Properties>
"""
class DescProps:
    def __init__(self, folder_name: str):
        self.folder_name = folder_name
        self.file_name = folder_name + "/props/desc.xml"
        self.difficulty = "EASY"
        self.language = "en"
        
    def check_file_integrity(self):
        # If the file already exists
        if os.path.isfile(self.file_name):
            with open(self.file_name, "r") as file:
                content = file.read()
                if not self.check_content(content):
                    raise ValueError(f"File '{self.file_name}' does not respect the constraints.")
                
        # If the file does not exist
        else:
            # Print a warning message
            print()
            print(f"> File '{self.file_name}' does not exist. Creating a default one with difficulty '{self.difficulty}' and language '{self.language}'.")
            print()
            with open(self.file_name, "w") as file:
                file.write(f"<Properties xmlns=\"http://www.w3.org/2001/WMLSchema\">\n")
                file.write(f"    <difficulty>{self.difficulty}</difficulty>\n")
                file.write(f"    <language>{self.language}</language>\n")
                file.write(f"</Properties>")
                
    def check_content(self, content: str) -> bool:
        # Check if all required fields are present
        if not self.check_field(content, "difficulty") or not self.check_field(content, "language"):
            return False
        
        return True
    
    def check_field(self, content: str, field: str) -> bool:
        return f"<{field}>" in content and f"</{field}>" in content
    

        
    