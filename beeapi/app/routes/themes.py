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
    return jsonify([theme.name for theme in loader.themes])

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