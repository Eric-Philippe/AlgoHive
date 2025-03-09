import xml.etree.ElementTree as ET

class Puzzle:
    def __init__(self, path: str, cipher: str, obscure: str, Forge, Decrypt, Unveil, xmlMetaProps, xmlDescProps):
        self.path: str = path
        self.cipher: str = cipher
        self.obscure: str = obscure
        self.Forge = Forge
        self.Decrypt = Decrypt
        self.Unveil = Unveil
        self.xmlMetaProps = xmlMetaProps
        self.xmlDescProps = xmlDescProps
        
    def get_name(self):
        return self.path.split('/')[-1]
    
    def get_puzzle_desc(self):
        return DescProps(self.xmlDescProps)
    
    def get_puzzle_meta(self):
        return MetaProps(self.xmlMetaProps)
    
    def get_difficulty(self):
        return self.get_puzzle_desc().difficulty
    
    def get_language(self):
        return self.get_puzzle_desc().language
    
    def get_id(self):
        return self.get_puzzle_meta().id
    
    def get_author(self):
        return self.get_puzzle_meta().author
    
    def get_created(self):
        return self.get_puzzle_meta().created
    
    def get_modified(self):
        return self.get_puzzle_meta().modified
        
    def get_cipher(self):
        return self.cipher
    
    def get_obscure(self):
        return self.obscure
    
"""
<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <difficulty>EASY</difficulty>
    <language>en</language>
</Properties>
"""
class DescProps:
    def __init__(self, xmlDescProps):
        self.xmlDescProps = xmlDescProps
        self.difficulty = None
        self.language = None
        self._parse_xml()
        
    def _parse_xml(self):
        namespaces = {'wml': 'http://www.w3.org/2001/WMLSchema'}
        root = ET.fromstring(self.xmlDescProps)
        self.difficulty = root.find('wml:difficulty', namespaces).text
        self.language = root.find('wml:language', namespaces).text
        
"""
<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <author>Éric</author>
    <created>2025-03-06T22:00:00Z</created>
    <modified>2025-03-06T22:00:00Z</modified>
    <title>Meta</title>
    <id>1</id>
</Properties>
"""
class MetaProps:
    def __init__(self, xmlMetaProps):
        self.xmlMetaProps = xmlMetaProps
        self.author = None
        self.created = None
        self.modified = None
        self.title = None
        self.id = None
        self._parse_xml()
        
    def _parse_xml(self):
        namespaces = {'wml': 'http://www.w3.org/2001/WMLSchema'}
        root = ET.fromstring(self.xmlMetaProps)
        self.author = root.find('wml:author', namespaces).text
        self.created = root.find('wml:created', namespaces).text
        self.modified = root.find('wml:modified', namespaces).text
        self.title = root.find('wml:title', namespaces).text
        self.id = root.find('wml:id', namespaces).text