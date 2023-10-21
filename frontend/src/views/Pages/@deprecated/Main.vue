<template>
    <b-container
        id="wrapper" 
        @drop="onDrop($event)"
        @dragover.prevent
        @dragenter.prevent
    >
        <b-row class="screen-dim">
            <b-col class="screen-dim">
                <div
                    id="central-view"
                    class="screen-dim"
                >
                    <div>
                        <template v-for="item in activeItems">
                            <MapObject
                                v-if="item.type === 'mapObject'"
                                :key="item.id"
                                :item-id="item.id"
                                :dx="item.properties.dx"
                                :dy="item.properties.dy"
                                :d-height="item.properties.height"
                                :d-width="item.properties.width"
                                :layer-list="item.properties.layerList"
                                :linked-view-state="checkForUpdate()"
                                @updatePositions="(args)=>updateItemPosition(item.id, args)"
                                @removeMap="removeItemOfID(item.id)"
                                @click.native="onSelection(item.id)"
                                @selectLinks="selectLinks"
                            />
                            <Widget
                                v-if="item.type === 'widget'"
                                :key="item.id"
                                :item-id="item.id"
                                :dx="item.properties.dx"
                                :dy="item.properties.dy"
                                :layer-list="item.properties.layerList" 
                                :linked-view-state="linkedViewState"
                                :d-height="item.properties.height"
                                :d-width="item.properties.width"
                                @updatePositions="(args)=>updateItemPosition(item.id, args)"
                                @removeMap="removeItemOfID(item.id)"
                                @SelectedData="ProcessSelectedData"
                            />
                        </template>
                    </div>
                </div>
            </b-col>
        </b-row>
    </b-container>
</template>
<script>
import * as d3 from "d3"
import MapObject from "../Components/MapObject/mapObject.vue"
import Widget from "../Components/Widget/widgets.vue"
import { bus } from "../../index"

/* 
        {'id': "mapObject-1", 'type':'mapObject', properties: {'dx':500 , 'dy':50, 'width':300, 'height':200 }},
        {'id': "mapObject-2", 'type':'mapObject', properties: {'dx':700 , 'dy':400, 'width':300, 'height':200 }},
        {'id': "widget-1", 'type':'widget', properties: {'dx':200 , 'dy':200, 'width':300, 'height':200 }},
*/
export default {
    name: "Main",
    components: {
        MapObject,
        Widget,
    },
    props: {
        fireList: Array,
    },
    data() {
        return {
            dataFetched: true,
            activeItems: [],
            backUpActiveItems: [],
            links:[],
            currentID: 4,
            selectingALink: false,
            sourceLink: "",
            destLink: "",
            linkedViewState: null,
            currentLayoutName: "Default",
            newPositionToUse: []
        }
    },
    created() {
        this.init()
    },
    mounted() {
    },
    methods: {
        init() {
            this.loadLayout("Default")
            this.shipMapObject()
            this.shipMapObjectLinks()
            this.busListener()
        },
        busListener() {
            bus.$on("addMap", () => {
                this.addMapObject()
            })

            bus.$on("addWidget", () => {
                this.addWidget()
            })

            bus.$on("saveLayout", (name) => {
                this.saveLayoutState(name)
                this.shipMapObjectLinks()
            })

            bus.$on("updateLinksObj", (arr) => {
                // this.links = this.$store.getters["layouts/getLinks"](arr[0]); (DEPRECATED 4/15/21, Changed VUEX -> VUEX, PINIA, AXIOS)
                this.links.push(arr[1])
                this.shipMapObjectLinks()
            })

            bus.$on("updateOldObj", (arr) => {
                // this.links = this.$store.getters["layouts/getLinks"](arr[0]);  (DEPRECATED 4/15/21, Changed VUEX -> VUEX, PINIA, AXIOS)
                this.links.push(arr[1])
                for (let i = 0; i < this.links.length; i++) {
                    if(this.links[i] == arr[1]){
                        this.links[i] = [...arr[2]][0]
                        break
                    }
                }
                this.shipMapObjectLinks()
            })

            bus.$on("loadLayout", (name) => {
                /* If not (Default, Fullscreen, Split Screen) prompt to save as new layout or update old save */
                this.loadLayout("Blank")
                this.currentLayoutName = name
                document.getElementById("title").innerHTML = name
                this.$nextTick(() => {
                    this.loadLayout(name)
                })
                this.newPositionToUse = []
            })

            bus.$on("RemoveLinks", (targetLink) => {
                this.removeLinks(targetLink)
                this.shipMapObjectLinks()
            })

            bus.$on("newViewPosition", (newPosition) => {
                this.newPositionToUse = newPosition
            })
        },
        checkForUpdate(){
            for(let i = 0; i < this.links.length; i++){
                // Update positions in DeckGL
                if (this.links[i].source == this.newPositionToUse[0]){

                    if (this.newPositionToUse[2].includes(this.links[i].destination) == false){
                        this.newPositionToUse[2].push(this.links[i].destination)
                    }
          
                }else if (this.links[i].destination == this.newPositionToUse[0]){
          
                    if (this.newPositionToUse[2].includes(this.links[i].source) == false){
                        this.newPositionToUse[2].push(this.links[i].source)
                    }
        
                }else{
                    continue 
                }
            }
            return this.newPositionToUse
        },
        getItems(name) {
            return this.activeItems.filter((maps) => maps.type === name)
        },
        removeItemOfID(id) {
            let objectId = "#" + id
            d3.select(objectId).remove()
            this.activeItems = [...this.activeItems.filter((item) => item.id != id)] // (updating active items after filtering out the removed item is giving bugged behavior)
            this.saveLayoutState(this.currentLayoutName)
        },
        updateItemPosition(id, properties) {
            let itemIdx = this.activeItems.findIndex((item) => item.id == id)

            let new_obj = {
                dx: properties.dx,
                dy: properties.dy,
                width: properties.w,
                height: properties.h,
                layerList: properties.layerList
            }
            let standard_name = ["Default", "Fullscreen", "Split Screen", "Blank"]
            if(standard_name.findIndex((item) => item == this.currentLayoutName) != -1){
                console.log("Fail to save", this.currentLayoutName) 
            }else{
                // this.$store.commit("layouts/updateCurrentLayoutLocation", [itemIdx, new_obj]);
                console.log("not saving fix me: updateItemPosition") // (DEPRECATED 4/15/21, Changed VUEX -> VUEX, PINIA, AXIOS)
            }
        },
        saveLayoutState(layoutName) {
            console.log("Saving", layoutName)
            let standard_name = ["Default", "Fullscreen", "Split Screen", "Blank"]
            if(standard_name.findIndex((item) => item == layoutName) != -1){
                console.log("Fail to save", layoutName) 
            }else{
                let copyActiveItems = [...this.activeItems]
                let stateProperties = {
                    name: layoutName,
                    mapObjects: copyActiveItems.filter(
                        (item) => item.type == "mapObject"
                    ),
                    widgets: copyActiveItems.filter((item) => item.type == "widget"),
                    links: this.links
                }
                console.log(this.links[0])
                console.log(stateProperties)
                // this.$store.commit("layouts/saveLayout", Object.assign({},stateProperties)); //(DEPRECATED 4/15/21, Changed VUEX -> VUEX, PINIA, AXIOS)
            }   
        },

        loadLayout(name) {
            let jsonDeepClone = (value) => JSON.parse(JSON.stringify(value))
            // this.$nextTick(() => {})
            // this.activeItems = jsonDeepClone(this.$store.getters["layouts/getActiveItem"](name)); //(DEPRECATED 4/15/21, Changed VUEX -> VUEX, PINIA, AXIOS)
            this.shipMapObject()
        },

        shipMapObject(){
            // let defaultLayout = this.$store.getters["layouts/getLayoutByName"](this.$store.getters["layouts/getActiveLayout"]()); //(DEPRECATED 4/15/21, Changed VUEX -> VUEX, PINIA, AXIOS)
            let Arr = []
            for (var i = 0; i < defaultLayout.mapObjects.length; i++) {
                Arr.push(defaultLayout.mapObjects[i].id)
            }
            for (var i = 0; i < defaultLayout.widgets.length; i++) {
                Arr.push(defaultLayout.widgets[i].id)
            }
            this.links = defaultLayout.links
            bus.$emit("updateMapsandWidgets", [...Arr])
        },
        shipMapObjectLinks(){
            // let defaultLayout = this.$store.getters["layouts/getSavedLayoutsLinks"](); (DEPRECATED 4/15/21, Changed VUEX -> VUEX, PINIA, AXIOS)
            console.log(defaultLayout)
            bus.$emit("updateSaveMapObjectLinks", defaultLayout)
        },
        addMapObject() {
            /* TODO: There is a bug with giving Unique ID's to Maps & Widgets */
            this.currentID += 1
            let mapObject = {
                id: String("mapObject-" + this.currentID),
                type: "mapObject",
                properties: { dx: 500, dy: 50 },
            }
            this.activeItems.push({ ...mapObject })
            this.saveLayoutState(this.currentLayoutName)
        },
        addWidget() {
            this.currentID += 1
            let widget = {
                id: String("widget-" + this.currentID),
                type: "widget",
                properties: { dx: 500, dy: 50 },
            }
            this.activeItems.push({ ...widget })
            this.saveLayoutState(this.currentLayoutName)
        },
        onSelection(itemID) {
            if (this.selectingALink && !itemID.includes(this.sourceLink)) {
                this.destLink = itemID
                this.activeItems.forEach((opt) => {
                    let elem = document.getElementById(opt.id)
                    elem.classList.remove("linkOptions")
                })
                // Save link of source -> dest
                console.log("Linking ", this.sourceLink, " to ", this.destLink)
                const link = {
                    source:  this.sourceLink,
                    destination: this.destLink,
                    type: "Viewport"
                }
                this.links.push(link)
                this.sourceLink = ""
                this.destLink = ""

            }
        },
        selectLinks(itemID) {
            this.selectingALink = true
            this.sourceLink = itemID
            const linkOptions = this.activeItems.filter((item) => item.id != itemID)
            linkOptions.forEach((opt) => {
                let elem = document.getElementById(opt.id)
                elem.classList.toggle("linkOptions")
            })
        },
        removeLinks(targetLink){
            // this.$store.commit("layouts/removeTargetLinks", targetLink); (DEPRECATED 4/15/21, Changed VUEX -> VUEX, PINIA, AXIOS)
        },
        onDrop(evt){
            const dropInfo = evt.dataTransfer.getData('elementID')
        },
        ProcessSelectedData(data){
            let widgetMark = data[0]
            let selectedData = data[1]

            // Check links with widget and mapobjects
            // let defaultLayout = this.$store.getters["layouts/getLayoutByName"](this.$store.getters["layouts/getActiveLayout"]()); (DEPRECATED 4/15/21, Changed VUEX -> VUEX, PINIA, AXIOS)
            // console.log(this.$store.getters["layouts/getActiveLayout"]()) (DEPRECATED 4/15/21, Changed VUEX -> VUEX, PINIA, AXIOS)
            console.log(defaultLayout)
            console.log(widgetMark)
            console.log(selectedData)

            let target = []
            for (var i = 0; i < defaultLayout.links.length; i++) {
                if (defaultLayout.links[i].destination == widgetMark){
                    target.push(defaultLayout.links[i].source)
                }else if(defaultLayout.links[i].source == widgetMark) {
                    target.push(defaultLayout.links[i].destination)
                }else{
                    continue
                }
            }

            for(var i = 0; i < target.length; i++){
                let temObj = target[i]
                for (let j = 0; j < defaultLayout.links.length; j++) {
                    if (defaultLayout.links[j].destination == temObj && !target.includes(defaultLayout.links[j].source) && defaultLayout.links[j].source != widgetMark){
                        target.push(defaultLayout.links[j].source)
                    }else if(defaultLayout.links[j].source == temObj && !target.includes(defaultLayout.links[j].destination) && defaultLayout.links[j].destination != widgetMark) {
                        target.push(defaultLayout.links[j].destination)
                    }else{
                        continue
                    }
                }
            }
            console.log(target)
            bus.$emit("MapObjectSelectedData", [target, selectedData])
        }
    },
}
</script>
<style lang="css" scoped>
.container {
  height: 100vh;
  background-color: #dedede;
  max-width: 100%;
}
.screen-dim {
  height: 100vh;
}
.linkOptions {
  box-shadow: 0 0 10px #26bf47;
}
</style>
