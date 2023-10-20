# Python program to update data file
 
from asyncio.windows_events import NULL
import json
from os import kill

def customSort(k):
    return k['fire_year']

with open("../../../assets/data/fireList.json", "r") as jsonFile:
    data = json.load(jsonFile)

inside_data = data.values()
k = 1
array = []
for i in inside_data:
    print(type(i))
    for j in i.values():
        print(type(j))
        for a in j:
            a.update({"uid" : "unique_" + str(k)})
            if type(a["fire_year"]) != int:
                a["fire_year"] = -1
            if type(a["acres"]) != int and type(a["acres"]) != float:
                a["acres"] = 0
            if a["name"] == NULL or a["name"] == "":
                continue
            a["acres"] = round(a["acres"], 4)
            k += 1
            array.append(a)

array.sort(key = lambda x: (x["fire_year"], x["acres"], x["name"]), reverse=True) 

new_dict = {"data" : {"fire": array}}

# print(data)
with open("../../../assets/data/fireList_after_modify.json", "w") as jsonFile:
    json.dump(new_dict, jsonFile)