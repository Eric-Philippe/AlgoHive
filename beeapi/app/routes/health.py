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