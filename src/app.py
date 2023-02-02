import flask
from flask import Flask, render_template, jsonify, request
from filter_pca import compute_pca

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/hello', methods=['GET', 'POST'])
def hello():
    filters = request.get_json()
    compute_pca(filters)
    jsonResp = {'status': 'done'}
    return jsonify(jsonResp)


if(__name__ == '__main__'):
    app.run(debug = True)
    