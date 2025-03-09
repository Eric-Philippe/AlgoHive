import os
from flask import jsonify
from .. import app

@app.route('/ping', methods=['GET'])
def ping():
    """
    Health check endpoint
    ---
    tags:
      - App
    responses:
      200:
        description: Pong response
    """
    return jsonify({'message': 'pong'})
  
@app.route('/name', methods=['GET'])
def name():
    """
    Get the name of the app
    ---
    tags:
      - App
    responses:
      200:
        description: The name of the app
    """
    server_name = os.getenv('SERVER_NAME', 'Local')
    return jsonify({'name': server_name})