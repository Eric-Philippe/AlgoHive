from app import app, loader
from app.models.puzzle import Puzzle

def get_puzzle_info(theme_name, puzzle: Puzzle):
    puzzle_sizes = loader.get_puzzle_sizes(theme_name, puzzle.get_name())
    
    return {
        'name': puzzle.get_name(),
        'compressedSize': puzzle_sizes[0],
        'uncompressedSize': puzzle_sizes[1],
        'difficulty': puzzle.get_difficulty(),
        'language': puzzle.get_language(),
        'cipher': puzzle.get_cipher(),
        'obscure': puzzle.get_obscure()
    }

def get_theme_info(theme):
    return {
        'name': theme.name,
        'enigmes_count': len(theme.puzzles),
        'puzzles': [get_puzzle_info(theme.get_name(), p) for p in theme.puzzles],
        'size': loader.get_dir_size(theme.get_path())
    }