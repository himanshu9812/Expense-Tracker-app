from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    # Get the port from the environment variable or default to 5000
    port = int(os.environ.get("PORT", 5000))
    
    # Start the Flask app on the correct port and listen on all interfaces (0.0.0.0)
    app.run(debug=True, host='0.0.0.0', port=port)
