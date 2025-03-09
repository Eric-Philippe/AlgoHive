from flask import jsonify, request, abort
import time
from .. import app, loader

last_reload_time = {}
COOLDOWN_PERIOD = 60 # 1 minute

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
    return jsonify([{'name': theme.name, 'enigmes_count': len(theme.puzzles)} for theme in loader.themes])
  
# Create theme
@app.route('/theme', methods=['POST'])
def create_theme():
    """
    Create a theme
    ---
    tags:
      - Themes
    parameters:
      - name: name
        in: query
        type: string
        required: true
        description: The name of the theme
    responses:
      200:
        description: The theme has been created
    """
    name = request.args.get('name')
    loader.create_theme(name)
    return jsonify({'message': 'Theme created'})
  
# Delete theme
@app.route('/theme', methods=['DELETE'])
def delete_theme():
    """
    Delete a theme
    ---
    tags:
      - Themes
    parameters:
      - name: name
        in: query
        type: string
        required: true
        description: The name of the theme
    responses:
      200:
        description: The theme has been deleted
    """
    name = request.args.get('name')
    if not loader.has_theme(name):
        abort(404, description="Theme not found")
    loader.delete_theme(name)
    return jsonify({'message': 'Theme deleted'})

@app.route('/theme/reload', methods=['POST'])
def reload():
    """
    Reload the puzzles
    ---
    tags:
      - Themes
    responses:
      429:
        description: Cooldown period in effect
      200:
        description: The puzzles have been reloaded
    """
    user_ip = request.remote_addr
    current_time = time.time()
    
    if user_ip in last_reload_time:
      elapsed_time = current_time - last_reload_time[user_ip]
      if elapsed_time < COOLDOWN_PERIOD:
        abort(429, description=f"Cooldown period in effect. Please wait {COOLDOWN_PERIOD - int(elapsed_time)} seconds.")
    
    last_reload_time[user_ip] = current_time
    
    loader.unload()
    loader.extract()
    loader.load()
    return jsonify({'message': 'Puzzles reloaded'})