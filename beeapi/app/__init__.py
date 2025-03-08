import os
from flask import Flask, send_from_directory
from flasgger import Swagger
from .utils.loader import PuzzlesLoader

app = Flask(__name__, static_folder='../frontend/dist')
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

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

from .routes import health, puzzles, themes