class Unveil:
    def __init__(self, lines: list):
        self.lines = lines
        
    def run(self):
        return sum(map(lambda x: int(x) * 2, self.lines))    
    
if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    unveil = Unveil(lines)
    solution = unveil.run()
    print(solution)
    
    