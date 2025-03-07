from flask import Flask, jsonify, request
from flasgger import Swagger
import atexit

from loader import PuzzlesLoader

app = Flask(__name__)
loader = PuzzlesLoader()

swagger_config = {
    "swagger": "2.0",
    "info": {
        "title": "Bee API",
        "description": "API for serving programming puzzles",
        "contact": {
            "responsibleDeveloper": "Éric PHILIPPE",
            "email": "ericphlpp@proton.me"
        },
        "version": "0.0.1"
    },
}
Swagger(app, template=swagger_config)

@app.route('/ping', methods=['GET'])
def ping():
    """
    Health check endpoint
    ---
    responses:
      200:
        description: Pong response
    """
    return jsonify({'message': 'pong'})

@app.route('/add', methods=['POST'])
def add():
    """
    Add two numbers
    ---
    parameters:
      - name: num1
        in: formData
        type: number
        required: true
      - name: num2
        in: formData
        type: number
        required: true
    responses:
      200:
        description: The sum of the two numbers
    """
    num1 = float(request.form.get('num1'))
    num2 = float(request.form.get('num2'))
    return jsonify({'sum': num1 + num2})
  
def on_exit():
    loader.unload()

if __name__ == '__main__':
    loader.extract()
    loader.load()
    
    atexit.register(on_exit)
    
    # forge_instance = loader.themes[0].puzzles[1].Forge(lines_count=10, unique_id="test123")
    # print(forge_instance.run())
    
    app.run(debug=True)
    
