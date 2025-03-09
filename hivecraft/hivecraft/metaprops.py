import os
import getpass
import datetime

"""
meta.xml is a file that contains the properties of the metadata of the Alghive file
<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <author>Éric</author>
    <created>2025-03-06T22:00:00Z</created>
    <modified>2025-03-06T22:00:00Z</modified>
    <title>Meta</title>
</Properties>
"""
class MetaProps:
    def __init__(self, folder_name: str):
        self.folder_name = folder_name
        self.file_name = folder_name + "/props/meta.xml"
        self.author = getpass.getuser()
        self.created = datetime.datetime.now() 
        self.modified = datetime.datetime.now()
        self.title = "Meta"
        
    def check_file_integrity(self):
        # If the file already exists
        if os.path.isfile(self.file_name):
            with open(self.file_name, "r") as file:
                content = file.read()
                if not self.check_content(content):
                    raise ValueError(f"File '{self.file_name}' does not respect the constraints.")
                
        # If the file does not exist
        else:
            with open(self.file_name, "w") as file:
                file.write(f"<Properties xmlns=\"http://www.w3.org/2001/WMLSchema\">\n")
                file.write(f"    <author>{self.author}</author>\n")
                file.write(f"    <created>{self.created}</created>\n")
                file.write(f"    <modified>{self.modified}</modified>\n")
                file.write(f"    <title>{self.title}</title>\n")
                file.write(f"</Properties>")
                
    def check_content(self, content: str) -> bool:
        # Check if all required fields are present
        if not self.check_field(content, "author") or not self.check_field(content, "created") or not self.check_field(content, "modified") or not self.check_field(content, "title"):
            return False
        
        return True
    
    def check_field(self, content: str, field: str) -> bool:
        return f"<{field}>" in content and f"</{field}>" in content
    

        
    