import { MapObject } from './model/mapObject'
import layerList from "./model/layerList"
import Vue from 'vue'

const state = () => ({
    layouts: [
        {
            name: "Default",
            mapObjects: [{ 'id': "mapObject-1", 'type': 'mapObject', 'properties': { 'dx': 200, 'dy': 50, 'width': 700, 'height': 200, 'layerList': layerList } },
                { 'id': "mapObject-2", 'type': 'mapObject', 'properties': { 'dx': 700, 'dy': 350, 'width': 300, 'height': 200, 'layerList': layerList } }],
            widgets: [{ 'id': "widget-1", 'type': 'widget', 'properties': { 'dx': 200, 'dy': 350, 'width': 300, 'height': 200, 'layerList': layerList  } }],
            links: [{
                source: "mapObject-1",
                destination: "mapObject-2",
                type: "Viewport"
            }]
        },
        {
            name: "Fullscreen",
            mapObjects: [{ 'id': "mapObject-1", 'type': 'mapObject', 'properties': { 'dx': 500, 'dy': 50, 'width': 300, 'height': 200, 'layerList': layerList } }],
            widgets: [],
            links: []
        },
        {
            name: "Split Screen",
            mapObjects: [{ 'id': "mapObject-1", 'type': 'mapObject', 'properties': { 'dx': 0, 'dy': 50, 'width': 300, 'height': 400, 'layerList': layerList } },
                { 'id': "mapObject-2", 'type': 'mapObject', 'properties': { 'dx': 50, 'dy': 0, 'width': 300, 'height': 400 } }],
            widgets: [],
            links: []
        },
        {
            name: "Blank",
            mapObjects: [],
            widgets: [],
            links: []
        }
    ],
    activeLayout: "Default"// Current Maps Object 
})

const getters = {
    getLayoutByName: (state) => (name) => state.layouts.find(layout => layout.name === name),
    isLayoutNameUsed: (state) => (name) => state.layouts.some(layout => layout.name === name),
    getSavedLayouts: (state) => () => 
    //TODO: update to fetch from database the saved layouts for this user
        state.layouts.map(layout => layout.name)
    ,
    getSavedLayoutsLinks: (state) => () => {
    //TODO: update to fetch from database the saved links for this user
        let initialLayoutName = ["Default", "Fullscreen", "Split Screen", "Blank"]
        let firstSort =  state.layouts.map(function sorting(x){
            if (!initialLayoutName.includes(x.name)){
                return { name: x.name, links: x.links }
            }
        })
        let result = []
        for (let i = 0; i < firstSort.length; i++){
            if (firstSort[i] != undefined){
                if (firstSort[i].links.length == 0){
                    continue
                }else{
                    for (let j = 0; j < firstSort[i].links.length; j++){
                        let tempObj = {
                            name: firstSort[i].name,
                            source: firstSort[i].links[j].source,
                            destination: firstSort[i].links[j].destination,
                            type: firstSort[i].links[j].type
                        }
                        result.push(tempObj)
                    }
                }
            }
        }
        return result
    },
    getTotalNumberOfLayouts: (state) => () => state.layouts.length,
    getActiveLayout: (state) => () => state.activeLayout,
    getActiveItem: (state) => (name) => {
        let layoutIndex = state.layouts.findIndex(layout => layout.name == name)
        let defaultLayout = state.layouts[layoutIndex]
        let aItems = []
        if (
            defaultLayout.mapObjects.length > 0 &&
        defaultLayout.widgets.length > 0
        ) {
            let layoutItems = [
                ...defaultLayout.mapObjects,
                ...defaultLayout.widgets,
            ]
            aItems = [].concat(...layoutItems)
        } else if (defaultLayout.mapObjects.length > 0) {
            aItems = defaultLayout.mapObjects
        } else if (defaultLayout.widgets.length > 0) {
            aItems = defaultLayout.widgets
        }

        return aItems
    },
    getLinks: (state) => (name) => {
        console.log(name)
        let layout = state.layouts.find(layout => layout.name == name)
        if(layout == undefined){
            return []
        }
        return layout.links
    },
    getCompare: (state) => () => state.layouts[0].mapObjects == state.layouts[state.layouts.length-1].mapObjects,
    isLinkExist: (state) => (arr) => {
        let target = state.layouts.find(layout => layout.name == arr[0])
        for(let i = 0; i < target.links.length; i++){
            let targetLink = target.links[i]
            if (targetLink.destination == arr[1].destination && 
          targetLink.source == arr[1].source &&
          targetLink.type == arr[1].type) {
                return true
            }else if (targetLink.destination == arr[2].destination && 
                targetLink.source == arr[2].source &&
                targetLink.type == arr[2].type) {
                return true
            }
        }
        return false
    }
}

const mutations = {
    saveLayout(state, layoutData) {
        let newLayout = {
            'name': layoutData.name,
            'mapObjects': [...layoutData.mapObjects],
            'widgets': [...layoutData.widgets],
            'links': [...layoutData.links]
        }
        console.log(newLayout)
        console.log("Updating: ", newLayout.name)
        let layoutIndex = state.layouts.findIndex(layout => layout.name == newLayout.name)
        console.log(layoutIndex)
        let jsonDeepClone = (value) => JSON.parse(JSON.stringify(value))
        let arrJsonDeepClone = jsonDeepClone(newLayout)
        if (layoutIndex != -1) {
            Vue.set(state.layouts, layoutIndex, Object.assign({}, arrJsonDeepClone))
        } else {
            Vue.set(state.layouts, state.layouts.length, Object.assign({}, arrJsonDeepClone))
        }
        state.activeLayout = newLayout.name
    //TODO: update database user profile with new saved layout
    },
  
    setActiveLayout(state, layoutName) {
        state.activeLayout = layoutName
        console.log(state)
    },

    removeTargetLinks(state, targetLink){
        let layoutIndex = state.layouts.findIndex(layout => layout.name == targetLink.name)
        if (layoutIndex != -1) {
            let tempLinks = state.layouts[layoutIndex].links
            console.log(targetLink)
            for(let i = 0; i < tempLinks.length; i++){
                if (tempLinks[i].destination == targetLink.destination &&
            tempLinks[i].source == targetLink.source &&
            tempLinks[i].type == targetLink.type){
                    tempLinks.splice(i, 1)
                    break
                }
            }
            Vue.set(state.layouts[layoutIndex], 'links', [...tempLinks])
        }
    },

    updateCurrentLayoutLocation(state, arr){
        let index = arr[0]
        let newProperties = arr[1]
        console.log(newProperties)
        let layoutIndex = state.layouts.findIndex(layout => layout.name == state.activeLayout)
        if(newProperties == undefined){
            console.log(state.activeLayout, " is pass null object")
        }
        else if (layoutIndex != -1) {
            console.log("Line158: ", newProperties)
            let usingLayout = state.layouts[layoutIndex]
            let mapObjSize = usingLayout.mapObjects.length
            if (index < mapObjSize) {
                Vue.set(state.layouts[layoutIndex].mapObjects[index], 'properties', newProperties)
            }else{
                let targetIndex = index - mapObjSize
                Vue.set(state.layouts[layoutIndex].widgets[targetIndex], 'properties', newProperties)
            }
        }

    }

}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}
