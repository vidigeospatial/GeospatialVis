from flask import Flask, request, Response
from flask_cors import CORS
import json
import os
import geopandas as gpd
import pandas as pd

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

@app.route("/data/<target>")
def get_data(target):
    if target == 'baseline_unmetdemand':
        # Ignore the first column
        df = pd.read_csv(proj_path + "/data/CS3_BL_DemandDeliveries.csv").iloc[:, 1:]
        result_df = pd.DataFrame()
        col_per_group = 3
        for i in range(0, len(df.columns), col_per_group):
            group = df.iloc[:, i:i + col_per_group]

            new_col_name = f"{'_'.join(group.columns[0].split('_')[:2])}"
            unmet_demand = group.iloc[:, 2] - group.iloc[:, 0]
            mask = group.iloc[:, 2] == -902
            unmet_demand[mask] = 0
            result_df[new_col_name] = unmet_demand
        ret = result_df.to_json()
    elif target == 'bl_h000_unmetdemand':
        # Ignore the first column
        df = pd.read_csv(proj_path + "/data/bl_h000_DemandDeliveries.csv").iloc[:, 1:]
        result_df = pd.DataFrame()
        col_per_group = 3
        for i in range(0, len(df.columns), col_per_group):
            group = df.iloc[:, i:i + col_per_group]

            new_col_name = f"{'_'.join(group.columns[0].split('_')[:2])}"
            unmet_demand = group.iloc[:, 2] - group.iloc[:, 0]
            mask = group.iloc[:, 2] == -902
            unmet_demand[mask] = 0
            result_df[new_col_name] = unmet_demand
        ret = result_df.to_json()
    elif target == 'baseline_groundwater':
        df = pd.read_csv(proj_path + "/data/CS3_BL_GWElevByElement.csv").iloc[:, 1:]
        result_df = pd.DataFrame()
        col_per_group = 3
        for i in range(0, len(df.columns), col_per_group):
            group = df.iloc[:, i:i + col_per_group]

            new_col_name = group.columns[0].split(":")[1][1:]
            result_df[new_col_name] = group.iloc[:, 0]
        ret = result_df.to_json()
    elif target == 'bl_h000_groundwater':
        df = pd.read_csv(proj_path + "/data/bl_h000_GWElevByElement.csv").iloc[:, 1:]
        result_df = pd.DataFrame()
        col_per_group = 3
        for i in range(0, len(df.columns), col_per_group):
            group = df.iloc[:, i:i + col_per_group]

            new_col_name = group.columns[0].split(":")[1][1:]
            result_df[new_col_name] = group.iloc[:, 0]
        print(result_df)

        ret = result_df.to_json()
    else:
        return Response(
            "Invalid data request",
            status=400
        )
    return ret

@app.route("/shapes/<target>")
def get_shape_GeoJson(target):
    if target == "demand_units":
        with open(proj_path + "/data/Demand_units.geojson") as f:
            data = json.load(f)
    elif target == "groundwater":
        with open(proj_path + "/data/Groundwater.geojson") as f:
            data = json.load(f)
    else:
        return Response(
            "Invalid shape request",
            status=400
        )
    return data
