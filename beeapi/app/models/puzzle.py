class Puzzle:
    def __init__(self, path: str, cipher: str, obscure: str, Forge, Decrypt, Unveil, xmlProps):
        self.path: str = path
        self.cipher: str = cipher
        self.obscure: str = obscure
        self.Forge = Forge
        self.Decrypt = Decrypt
        self.Unveil = Unveil
        self.xmlProps = xmlProps
        
    def get_name(self):
        return self.path.split('/')[-1]
