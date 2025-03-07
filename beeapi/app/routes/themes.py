from flask import jsonify
from .. import app, loader

@app.route('/themes', methods=['GET'])
def themes():
    """
    Get the list of themes
    ---
    tags:
      - Themes
    responses:
      200:
        description: The list of themes
    """
    return jsonify([theme.name for theme in loader.themes])

@app.route('/theme/reload', methods=['POST'])
def reload():
    """
    Reload the puzzles
    ---
    tags:
      - Themes
    responses:
      200:
        description: The puzzles have been reloaded
    """
    loader.unload()
    loader.extract()
    loader.load()
    return jsonify({'message': 'Puzzles reloaded'})