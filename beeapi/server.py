import sys
import signal
import atexit
from app import app, loader

def on_exit():
    loader.unload()
    
def handle_signal(signum, frame):
    on_exit()
    sys.exit(0)

if __name__ == '__main__':
    loader.extract()
    loader.load()
    
    atexit.register(on_exit)
    
    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)
    
    app.run(host='0.0.0.0')
    