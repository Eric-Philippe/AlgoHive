import os
import uuid
import getpass
import datetime

"""
meta.xml is a file that contains the properties of the metadata of the Alghive file
<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <author>Éric</author>
    <created>2025-03-06T22:00:00Z</created>
    <modified>2025-03-06T22:00:00Z</modified>
    <title>Meta</title>
    <id>1</id>
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
        self.id = self.generate_uuid()
        
    def generate_uuid(self):
        return str(uuid.uuid4())
        
    def check_file_integrity(self, update: bool = False):
        # If the file already exists
        if os.path.isfile(self.file_name):
            with open(self.file_name, "r") as file:
                content = file.read()
                if not self.check_content(content):
                    raise ValueError(f"File '{self.file_name}' does not respect the constraints.")
            
            self.author = content.split("<author>")[1].split("</author>")[0]
            self.created = content.split("<created>")[1].split("</created>")[0]
            self.modified = content.split("<modified>")[1].split("</modified>")[0]
            self.title = content.split("<title>")[1].split("</title>")[0]
            self.id = content.split("<id>")[1].split("</id>")[0]
            self.modified = datetime.datetime.now()
            
            if update:
                self.id = self.generate_uuid()
                
        self.write_file()
                
    def write_file(self):
        with open(self.file_name, "w") as file:
            file.write(f"<Properties xmlns=\"http://www.w3.org/2001/WMLSchema\">\n")
            file.write(f"    <author>{self.author}</author>\n")
            file.write(f"    <created>{self.created}</created>\n")
            file.write(f"    <modified>{self.modified}</modified>\n")
            file.write(f"    <title>{self.title}</title>\n")
            file.write(f"    <id>{self.id}</id>\n")
            file.write(f"</Properties>")
                
    def check_content(self, content: str) -> bool:
        # Check if all required fields are present
        if not self.check_field(content, "author") or not self.check_field(content, "created") or not self.check_field(content, "modified") or not self.check_field(content, "title") or not self.check_field(content, "id"):
            return False
        
        return True
    
    def check_field(self, content: str, field: str) -> bool:
        return f"<{field}>" in content and f"</{field}>" in content
    

        
    