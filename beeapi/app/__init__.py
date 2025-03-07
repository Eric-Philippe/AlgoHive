from flask import Flask
from flasgger import Swagger
from .utils.loader import PuzzlesLoader

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

from .routes import health, puzzles, themes