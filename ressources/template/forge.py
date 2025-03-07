# forge.py - Génère input.txt
import sys
import random

class Forge:
    def __init__(self, lines_count: int, unique_id: str = None):
        self.lines_count = lines_count
        self.unique_id = unique_id
    
    def run(self) -> list:
        random.seed(self.unique_id)
        lines = []
        for _ in range(self.lines_count):
            lines.append(self.generate_line(_))
        return lines
    
    def generate_line(self, index: int) -> str:
        # TODO: TO BE IMPLEMENTED
        pass

if __name__ == '__main__':
    lines_count = int(sys.argv[1])
    unique_id = sys.argv[2]
    forge = Forge(lines_count, unique_id)
    lines = forge.run()
    with open('input.txt', 'w') as f:
        f.write('\n'.join(lines))