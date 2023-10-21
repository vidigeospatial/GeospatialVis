from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

proj_path = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SERVER_NAME'] = 'infovis.cs.ucdavis.edu'

CORS(app)
app.url_map.strict_slashes = False

@app.route("/")
def hello_world():
    print("Hello Geospatial")
    return "Hello Geospatial"

@app.route("/test")
def test():
    print("In test")# Get the path of current working directory 
    path = os.getcwd() 
    
    # Get the list of all files and directories 
    # in current working directory 
    dir_list = os.listdir(path) 
    
    
    print("Files and directories in '", path, "' :")  
    # print the list 
    print(dir_list)
    return dir_list

@app.route("/difference")
def difference():
    print("SDFSDF")
    with open(proj_path + "data/difference_unmetdemand.json") as f:
        data = json.load(f)
    print(data)
    return data
