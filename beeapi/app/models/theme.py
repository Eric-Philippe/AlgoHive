from app.models.puzzle import Puzzle
from typing import List

class Theme:
    def __init__(self, name: str, path: str, puzzles: List[Puzzle]):
        self.name: str = name
        self.path: str = path
        self.puzzles: List[Puzzle] = puzzles
        
    def get_name(self):
        return self.name
    
    def get_path(self):
        return self.path