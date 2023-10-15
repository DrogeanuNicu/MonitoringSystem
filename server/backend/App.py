import os
from flask import Flask, jsonify, request

template_dir = os.path.abspath('../frontend/public')
app = Flask(__name__, template_folder=template_dir)

data = {"message": "Hello from Flask!"}

@app.route('/hello', methods=['GET'])
def get_data():
    return jsonify(data)

if __name__ == '__main__':
    app.run()
