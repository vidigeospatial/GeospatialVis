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
#app.config['SERVER_NAME'] = 'vidigeospatial.github.io'

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



@app.route("/data/scenario/<target_scenario>/<target_data>")
def get_data_scenario(target_scenario, target_data):
    if target_scenario not in ['CS3_BL','bl_h000', 'LTO_BA_EXP1_2022MED', 'CS3_ALT3_2022med_L2020ADV', 'CS3_ALT3_2040MED_COEQ20230821_L2020DV', 'CS3_NAA_2022MED_071923_L2020ADV', 'CS3_NAA_2040MED_COEQ20230818_L2020ADV']:
        return Response(
                "Invalid target scenario",
                status=400
                )
    elif target_data not in ['unmetdemand']:
        return Response(
                "Invalid target data",
                status=400
                )
    else:
        df = pd.read_csv(f'{proj_path}/data/{target_scenario}_DemandDeliveries.csv').iloc[:, 1:]
        if target_scenario not in ['CS3_BL', 'bl_h000']:
            # 1 cfs will produce 724 acre-feet of water per year.	
            # So multiplier is 724 / 12 / 1000 = 0.060333333
            df = df.applymap(lambda x: x * 0.0603333)
        # print(df)
        result_df = pd.DataFrame()
        # Is a hack, need to standardize this
        col_per_group = 3 if 'dgTotVar' in df.columns[2] else 2
        print('col_per_group', col_per_group)
        for i in range(0, len(df.columns), col_per_group):
            group = df.iloc[:, i:i + col_per_group]

            new_col_name = f"{'_'.join(group.columns[0].split('_')[:2])}"
            unmet_demand = group.iloc[:, -1] - group.iloc[:, 0]
            mask = group.iloc[:, -1] == -902
            unmet_demand[mask] = 0
            result_df[new_col_name] = unmet_demand
        
        ret = result_df.to_json()
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
