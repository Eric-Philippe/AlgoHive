import atexit
from app import app, loader

def on_exit():
    loader.unload()

if __name__ == '__main__':
    loader.extract()
    loader.load()
    
    atexit.register(on_exit)
    
    app.run()
    