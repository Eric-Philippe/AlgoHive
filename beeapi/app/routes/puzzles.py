from flask import jsonify, request
from .. import app, loader

@app.route('/puzzles', methods=['GET'])
def puzzles():
    """
    Get the list of puzzles for a theme
    ---
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
            return jsonify([p.get_name() for p in t.puzzles])
    return jsonify({'message': 'Theme not found'})

@app.route('/puzzle/generate', methods=['GET'])
def run():
    """
    Run a puzzle
    ---
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

@app.route('/puzzle/getdescription', methods=['GET'])
def get_description():
    """
    Get the description of a puzzle
    ---
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
        description: The cipher and obscure of the puzzle
    """
    theme = request.args.get('theme')
    puzzle = request.args.get('puzzle')
    
    for t in loader.themes:
        if t.name == theme:
            for p in t.puzzles:
                if p.get_name() == puzzle:
                    return jsonify({'cipher': p.cipher, 'obscure': p.obscure})
    return jsonify({'message': 'Theme or puzzle not found'})