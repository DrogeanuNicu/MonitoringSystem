from flask import Flask


app = Flask(__name__, 
            static_folder="../frontend/build", 
            static_url_path="/")
data = {"message": "Hello from Flask!"}


@app.route('/api/hello', methods=['GET'])
def get_data():
    return data


if __name__ == '__main__':
    app.run()
