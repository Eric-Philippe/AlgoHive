from flask import jsonify, request, abort
from .. import app, loader
from ..utils.utils import get_puzzle_info

@app.route('/puzzles', methods=['GET'])
def puzzles():
    """
    Get the list of puzzles for a theme
    ---
    tags:
      - Puzzles
    parameters:
      - name: theme
        in: query
        type: string
        required: true
    responses:
      200:
        description: The list of puzzles
    """
    theme = request.args.get('theme')
    for t in loader.themes:
        if t.name == theme:
            return jsonify([get_puzzle_info(theme, p) for p in t.puzzles])
    return jsonify({'message': 'Theme not found'})
  
@app.route('/puzzles/names', methods=['GET'])
def puzzles_names():
    """
    Get the list of puzzles names for a theme
    ---
    tags:
      - Puzzles
    parameters:
      - name: theme
        in: query
        type: string
        required: true
    responses:
      200:
        description: The list of puzzles names
    """
    theme = request.args.get('theme')
    for t in loader.themes:
        if t.name == theme:
            return jsonify([p.get_name() for p in t.puzzles])
    return jsonify({'message': 'Theme not found'})
  
@app.route('/puzzle', methods=['GET'])
def get_description():
    """
    Get the description of a puzzle
    ---
    tags:
      - Puzzles
    parameters:
      - name: theme
        in: query
        type: string
        required: true
      - name: puzzle
        in: query
        type: string
        required: true
    responses:
      200:
        description: The cipher and obscure of the puzzle and the description of the puzzle and the size of the puzzle
    """
    theme = request.args.get('theme')
    puzzle = request.args.get('puzzle')
    
    for t in loader.themes:
        if t.name == theme:
            for p in t.puzzles:
                if p.get_name() == puzzle:
                  return jsonify(get_puzzle_info(theme, p))
    return jsonify({'message': 'Theme or puzzle not found'})

@app.route('/puzzle/generate', methods=['GET'])
def run():
    """
    Run a puzzle
    ---
    tags:
      - Puzzles
    parameters:
      - name: theme
        in: query
        type: string
        required: true
      - name: puzzle
        in: query
        type: string
        required: true
      - name: unique_id
        in: query
        type: string
        required: true
    responses:
      200:
        description: The computed result
    """
    theme = request.args.get('theme')
    puzzle = request.args.get('puzzle')
    unique_id = request.args.get('unique_id')
    
    for t in loader.themes:
        if t.name.strip() == theme.strip():
          for p in t.puzzles:
              if p.get_name() == puzzle.strip():
                  input_lines = p.Forge(lines_count=400, unique_id=unique_id).run()
                  first_solution = p.Decrypt(input_lines).run()
                  second_solution = p.Unveil(input_lines).run()
                  return jsonify({'first_solution': first_solution, 'second_solution': second_solution, 'input_lines': input_lines})
    return jsonify({'message': 'Theme or puzzle not found'})
  
@app.route('/puzzle/upload', methods=['POST'])
def upload_puzzle():
    """
    Upload puzzle
    ---
    tags:
      - Puzzles
    parameters:
      - name: theme
        in: query
        type: string
        required: true
        description: The name of the theme
      - name: file
        in: formData
        type: file
        required: true
        description: The file containing
        
    responses:
      200:
        description: The puzzle has been uploaded
    """
    theme_name = request.args.get('theme')
    theme = loader.get_theme(theme_name)
    if theme is None:
        abort(404, description="Theme not found")
    
    file = request.files['file']
    fileName = file.filename
    if fileName is None: 
        fileName = "$$ERROR$$"
      
    if loader.has_puzzle(theme, fileName):
        abort(400, description="Puzzle " + fileName + " already exists")
    
    loader.upload_puzzle(theme, file)
    return jsonify({'message': 'Puzzle uploaded'})
  
@app.route('/puzzle', methods=['DELETE'])
def delete_puzzle():
    """
    Delete puzzle
    ---
    tags:
      - Puzzles
    parameters:
      - name: theme
        in: query
        type: string
        required: true
        description: The name of the theme
      - name: puzzle
        in: query
        type: string
        required: true
        description: The name of the puzzle
        
    responses:
      200:
        description: The puzzle has been deleted
    """
    theme_name = request.args.get('theme')
    theme = loader.get_theme(theme_name)
    if theme is None:
        abort(404, description="Theme not found")
    
    puzzle_name = request.args.get('puzzle')
    if not loader.has_puzzle(theme, puzzle_name):
        abort(404, description="Puzzle not found")
    
    loader.delete_puzzle(theme, puzzle_name)
    return jsonify({'message': 'Puzzle deleted'})