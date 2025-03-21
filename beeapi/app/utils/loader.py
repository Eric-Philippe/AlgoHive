import os
import shutil
import zipfile
import importlib.util
import sys
from typing import List
from app.models.theme import Theme
from app.models.puzzle import Puzzle

class PuzzlesLoader:
    PUZZLES_DIR = 'puzzles'
    
    def __init__(self):
        self.themes: List[Theme] = []

    def load(self):
        """Load all the puzzles from the puzzles directory"""
        self._process_themes(self._load_theme)
        
    def extract(self):
        """Extract all the puzzles from the puzzles directory"""
        self._process_themes(self._extract_theme)

    def unload(self):
        """Unload all the puzzles from the puzzles directory"""
        self._process_themes(self._unload_theme)
        self.themes = []
        
    def reload(self):
        """Reload all the puzzles from the puzzles directory"""
        self.unload()
        self.extract()
        self.load()

    def _process_themes(self, process_function):
        for root, dirs, _ in os.walk(self.PUZZLES_DIR):
            if root.count(os.sep) - self.PUZZLES_DIR.count(os.sep) < 1:
                for dir in dirs:
                    process_function(dir)

    def _load_theme(self, theme):
        new_theme = Theme(theme, os.path.join(self.PUZZLES_DIR, theme), [])
        for root, dirs, _ in os.walk(os.path.join(self.PUZZLES_DIR, theme)):
            if root.count(os.sep) - self.PUZZLES_DIR.count(os.sep) < 2:
                for dir in dirs:
                    new_theme.puzzles.append(self._load_puzzle(theme, dir))
        self.themes.append(new_theme)

    def _unload_theme(self, theme):
        for root, dirs, _ in os.walk(os.path.join(self.PUZZLES_DIR, theme)):
            for dir in dirs:
                shutil.rmtree(os.path.join(root, dir))

    def _extract_theme(self, theme):
        for root, _, files in os.walk(os.path.join(self.PUZZLES_DIR, theme)):
            for file in files:
                if file.endswith('.alghive') and not os.path.exists(os.path.join(root, file[:-8])):
                    with zipfile.ZipFile(os.path.join(root, file), 'r') as zip_ref:
                        zip_ref.extractall(os.path.join(root, file[:-8]))

    def _load_module(self, file_path):
        module_name = os.path.splitext(os.path.basename(file_path))[0]
        spec = importlib.util.spec_from_file_location(module_name, file_path + ".py")
        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)
        return module

    def _load_puzzle(self, theme, puzzle):
        forge_module = self._load_module(os.path.join(self.PUZZLES_DIR, theme, puzzle, 'forge'))
        forge_class = getattr(forge_module, 'Forge', None)

        if forge_class is None:
            raise ImportError(f"Le fichier forge.py de l'énigme {puzzle} ne contient pas de classe 'Forge'.")
        
        decrypt_module = self._load_module(os.path.join(self.PUZZLES_DIR, theme, puzzle, 'decrypt'))
        decrypt_class = getattr(decrypt_module, 'Decrypt', None)
        
        if decrypt_class is None:
            raise ImportError(f"Le fichier decrypt.py de l'énigme {puzzle} ne contient pas de classe 'Decrypt'.")
        
        unveil_module = self._load_module(os.path.join(self.PUZZLES_DIR, theme, puzzle, 'unveil'))
        unveil_class = getattr(unveil_module, 'Unveil', None)
        
        if unveil_class is None:
            raise ImportError(f"Le fichier unveil.py de l'énigme {puzzle} ne contient pas de classe 'Unveil'.")
        
        xmlMetaProps = self._read_file(os.path.join(self.PUZZLES_DIR, theme, puzzle, 'props/meta.xml'))
        xmlDescProps = self._read_file(os.path.join(self.PUZZLES_DIR, theme, puzzle, 'props/desc.xml'))
        cipher = self._read_file(os.path.join(self.PUZZLES_DIR, theme, puzzle, 'cipher.html'))
        obscure = self._read_file(os.path.join(self.PUZZLES_DIR, theme, puzzle, 'obscure.html'))
        
        return Puzzle(os.path.join(self.PUZZLES_DIR, theme, puzzle), cipher, obscure, forge_class, decrypt_class, unveil_class, xmlMetaProps, xmlDescProps)

    def _read_file(self, file_path):
        with open(file_path, 'r') as file:
            return file.read()
        
    def create_theme(self, name):
        os.makedirs(os.path.join(self.PUZZLES_DIR, name))
        self.themes.append(Theme(name, os.path.join(self.PUZZLES_DIR, name), []))
        
    def delete_theme(self, name):
        self._unload_theme(name)
        shutil.rmtree(os.path.join(self.PUZZLES_DIR, name))
        self.themes = [theme for theme in self.themes if theme.name != name]
        
    def get_theme(self, name):
        return next((theme for theme in self.themes if theme.name == name), None)
        
    def has_theme(self, name):
        return name in [theme.name for theme in self.themes]
    
    def has_puzzle(self, theme, puzzle_name):
        if puzzle_name.endswith('.alghive'):
            puzzle_name = puzzle_name[:-8]
        return puzzle_name in [puzzle.get_name() for puzzle in theme.puzzles]
    
    def get_puzzle_sizes(self, theme, puzzle):
        """
        Get the puzzle .alghive file size and the puzzle directory size in bytes
        """
        alghive_size = os.path.getsize(os.path.join(self.PUZZLES_DIR, theme, puzzle + '.alghive'))
        puzzle_size = self.get_dir_size(os.path.join(self.PUZZLES_DIR, theme, puzzle))
        return alghive_size, puzzle_size
    
    def get_dir_size(self, path='.'):
        total = 0
        with os.scandir(path) as it:
            for entry in it:
                if entry.is_file():
                    total += entry.stat().st_size
                elif entry.is_dir():
                    total += self.get_dir_size(entry.path)
        return total
    
    def upload_puzzle(self, theme: Theme, alghive_archive):
        theme_dir = os.path.join(self.PUZZLES_DIR, theme.get_name())
        alghive_archive.save(os.path.join(theme_dir, alghive_archive.filename))
        
    def delete_puzzle(self, theme: Theme, puzzle_name):
        if puzzle_name.endswith('.alghive'):
            puzzle_name = puzzle_name[:-8]
        shutil.rmtree(os.path.join(self.PUZZLES_DIR, theme.get_name(), puzzle_name))
        os.remove(os.path.join(self.PUZZLES_DIR, theme.get_name(), puzzle_name + '.alghive'))
        theme.puzzles = [puzzle for puzzle in theme.puzzles if puzzle.get_name() != puzzle_name]
        

