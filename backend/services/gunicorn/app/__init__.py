from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SERVER_NAME'] = 'infovis.cs.ucdavis.edu'

CORS(app)
app.url_map.strict_slashes = False

@app.route("/")
def hello_world():
    print("Hello Geospatial")
    return "Hello Geospatial"