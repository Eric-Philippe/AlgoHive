class Decrypt:
    def __init__(self, lines: list):
        self.lines = lines
        
    def run(self):
        return len(self.lines)
    
if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    decrypt = Decrypt(lines)
    solution = decrypt.run()
    print(solution)
    
    