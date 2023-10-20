<template>
    <div 
        :id="itemId"
        :style="{width: width + 'px', height: height + 'px', position: 'absolute', top: y + 'px', left: x + 'px', resize: 'both', overflow: 'hidden', }"
        :draggable="shouldDrag"
        @dragstart="startDrag($event)"
        @dragover="dragOver($event)"
        @dragend="endDrag($event)"
        @click="hasResizeEnded($event)"
    >
        <div
            id="widgets"
            class="widget-container"
        >
            <StatusBar
                :map-i-d="itemId"
                @toggleDragOn="toggleDragOn"
                @toggleDragOff="toggleDragOff"
                @closeMap="closeMap"
                @fullScreen="fullscreen"
                @toggleLayers="toggleLayers"
                @changeWidgetView="changeView"
                @cleanScreen="cleanPerimeter"
            />

            <div
                id="widgetView"
                class="content"
            >
                <div
                    v-if="activeView.includes('FireList')"
                    id="fireListView"
                >
                    <li
                        v-for="(item, index) in fireListData" 
                        :key="index" 
                        class="item_list"
                        @click="toggleVisible(item)"
                    >
                        {{ item.name }} _ {{ item.acres }} _ {{ item.fire_year }}
                    </li>
                </div>
                <Timeline
                    v-else-if="activeView.includes('TimeLine')"
                    :width="viewWidth"
                    :height="viewHeight"
                    :clear="cleanUpPerimeter"
                    @selection="selectedArr"
                />      
            </div>
        </div>
        <resize-observer @notify="handleResize" />
    </div>
</template>
<script>
import * as d3 from "d3"
import StatusBar from "../MapObject/Features/statusBar.vue"
import firelist from "../../../assets/data/fireList_after_modify.json"
import item from "./item.vue"
import Timeline from "./timeline/Timeline.vue"

export default {
    name: "Widget",
    components: {
        StatusBar,
        Timeline,
    },
    props: {
        dx: {
            type: Number,
            default: 0,
        },
        dy: {
            type: Number,
            default: 0,
        },
        dWidth: {
            type: Number,
            default: 300,
        },
        dHeight: {
            type: Number,
            default: 200,
        },
        itemId: {
            type: String,
            default: "mapObj",
        },
        layerList: {
            type: Array,
            default() {
                return []
            },
        },
    },
    data () {
        return {
            show: "none",
            shouldDrag: false,
            shouldResize: false,
            showLayerList: false,
            redraw: false,
            width: 300,
            height: 200,
            viewWidth: 0,
            viewHeight: 0,
            test: 300,
            x: 0,
            y: 0,
            mouseX: 0,
            mouseY: 0,
            deltaX: 0,
            deltaY: 0,
            dropDownMenu: {
                display: "none",
                color: "White",
                background: "#161e20",
                border: "none",
            },
            activeState: "none",
            appear: false,
            fireListData: [],
            itemComponent: item,
            activeView: "",
            cleanUpPerimeter: false
        }
    },
    created() {
        this.x = this.dx
        this.y = this.dy
        this.width = this.dWidth
        this.height = this.dHeight
        this.viewWidth = this.width 
        this.viewHeight = this.height
    
    },
    mounted() {
        this.redraw = !this.redraw
        this.fireListData = firelist.data.fire
    },
    methods: {
        changeContents(content) {
            this.show = content
            if (content == "timeline" && !this.appear) {
                document.getElementById("newComponet").style.display = "initial"
            }
        },
        onResize(x, y, width, height) {
            /* TODO: trigger resize events for children
                   All text should be svg (easy for resizing)
          */
            this.x = x
            this.y = y
            this.width = width
            this.height = height
        },
        toggleLayers() {
            this.showLayerList = !this.showLayerList
        },
        startDrag(evt) {
            evt.dataTransfer.dropEffect = "move"
            evt.dataTransfer.effectAllowed = "move"
            this.mouseX = evt.clientX
            this.mouseY = evt.clientY
        },
        endDrag(evt) {
            evt.preventDefault()
            let dropLocation = this.handleDrag(evt)
            dropLocation.itemID = this.itemId
            console.log("dragFinished", dropLocation)
            evt.dataTransfer.setData("elementID", dropLocation)
            this.shouldDrag = false
        },
        dragOver(evt) {
            evt.preventDefault()
            return false
        },
        handleDrag(evt) {
            let dropLocation = {}
            this.deltaX = this.mouseX - evt.clientX
            this.deltaY = this.mouseY - evt.clientY
            this.x -= this.deltaX
            this.y -= this.deltaY
            this.mouseX = evt.clientX
            this.mouseY = evt.clientY
            dropLocation.x = this.x
            dropLocation.y = this.y
            return dropLocation
        },
        hasResizeEnded(evt){
            if(this.resizing){
                this.resizing = !this.resizing
            }
            console.log("resize finished")
        },
        onResizestop(x, y, width, height) {
            // Update VUEX state to trigger resize of map
            this.redraw = !this.redraw
            this.$emit("updatePositions", {
                dx: this.x,
                dy: this.y,
                w: this.width,
                h: this.height,
            })
        },
        toggleDragOn() {
            this.shouldDrag = true
        },
        toggleDragOff() {
            this.shouldDrag = false
        },
        closeMap() {
            this.$emit("removeMap", true)
        },
        fullscreen() {
            // TODO: add logic to reset before the fullscreen call
            let width = d3.select("#central-view").node().clientWidth
            let height = d3.select("#central-view").node().clientHeight

            this.x = 0
            this.y = 0
            this.width = width
            this.height = height
            this.redraw = !this.redraw
        },
        toggleDropdown() {
            if (this.dropDownMenu.display == "none") {
                this.dropDownMenu.display = "block"
            } else {
                this.dropDownMenu.display = "none"
            }
        },
        toggleVisible(item) {
            console.log(item)
        },
        changeView(viewName){
            // Do something with the view name?
            this.activeView = viewName
        },
        cleanPerimeter(){
            this.cleanUpPerimeter = !this.cleanUpPerimeter
        },
        handleResize({ width, height }){
            console.log("handling something", width, height)
            // Get the widgetView height & width and pass that
            const widgetView = document.getElementById('widgetView')
            this.viewWidth = widgetView.offsetWidth
            this.viewHeight = widgetView.offsetHeight
            // TODO: this will fire every time it is being dragged which may not be ideal.  Need to add a method to poll or wait for resizing to pause before firing of the update/re-renders
            // set bool for resizing true
        },
        selectedArr(data){
            // Sent to Related Map Objects
            // Emit to upper layer
            this.$emit("SelectedData", [this.itemId, data])
        }
    },
}
</script>
<style media="screen">
.widget-handle-tl {
  top: -10px;
  left: -8px;
  cursor: nw-resize;
  border-top-color: black;
  border-top-style: solid;
  border-left-style: solid;
  border-left-color: black;
}

.widget-handle-tr {
  top: -10px;
  right: -8px;
  cursor: ne-resize;
  border-top-color: black;
  border-top-style: solid;
  border-right-style: solid;
  border-right-color: black;
}

.widget-handle-bl {
  bottom: -10px;
  left: -8px;
  cursor: sw-resize;
  border-bottom-color: black;
  border-bottom-style: solid;
  border-left-style: solid;
  border-left-color: black;
}

.widget-handle-br {
  bottom: -10px;
  right: -8px;
  cursor: se-resize;
  border-bottom-color: black;
  border-bottom-style: solid;
  border-right-style: solid;
  border-right-color: black;
}
.widget-handle {
  width: 10px;
  height: 10px;
  position: absolute;
  box-sizing: border-box;
  user-select: none;
}
</style>
<style ,>
.content {
  color: black;
  position: relative;
  border: none;
  min-height: 85%;
  height: 100%;
}
.widget-container {
  height: 100%;
  border: 1px solid black;
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
  position: relative;
  display: flex;
  flex-direction: column;
}
.view-buttons {
  display: none;
  color: Black;
  padding: 4px 20px;
  border: none;
}
.vdr {
  position: absolute;
  box-sizing: border-box;
  border: none;
}

.item_list {
  list-style-type: none;
  text-align: right;
  border-bottom: 1px solid lightgrey;
}
.item_list:hover {
  background-color: grey;
}
</style>
