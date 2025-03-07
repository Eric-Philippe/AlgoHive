from flask import jsonify
from .. import app, loader

@app.route('/themes', methods=['GET'])
def themes():
    """
    Get the list of themes
    ---
    responses:
      200:
        description: The list of themes
    """
    return jsonify([theme.name for theme in loader.themes])

@app.route('/reload', methods=['POST'])
def reload():
    """
    Reload the puzzles
    ---
    responses:
      200:
        description: The puzzles have been reloaded
    """
    loader.unload()
    loader.extract()
    loader.load()
    return jsonify({'message': 'Puzzles reloaded'})