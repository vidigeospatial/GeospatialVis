<template>
    <vue-draggable-resizable
        :id="itemId"
        class-name-handle="map-handle"
        :min-height="150"
        :handles="['tr','br','tl','bl']"
        :min-width="300"
        :w="width"
        :h="height"
        :x="x"
        :y="y"
        :draggable="shouldDrag"
        :active="false"
        @dragging="onDrag" 
        @dragstop="onDragstop"
        @resizing="onResize"
        @resizestop="onResizestop"
    >
        <div class="map-container">
            <StatusBar
                :map-i-d="itemId"
                @toggleDragOn="toggleDragOn"
                @toggleDragOff="toggleDragOff"
                @closeMap="closeMap"
                @fullScreen="fullscreen"
                @selectLinks="selectLinks"
                @toggleLayers="toggleLayers"
            />
            <GeoMap
                :resize-map="redraw"
                :map-object-i-d="itemId"
                :linked-view-state="buildNewPosition()"
            />
            <LayerList
                :reveal-list="showLayerList"
                :layer-list="layerList"
                :layer-i-d="itemId"
            />
        </div>
    </vue-draggable-resizable>
    </div>
</template>
<script>
import * as d3 from "d3"
import VueDraggableResizable from "vue-draggable-resizable"
import "vue-draggable-resizable/dist/VueDraggableResizable.css"
import GeoMap from "./Features/map.vue"
import StatusBar from "./Features/statusBar.vue"
import LayerList from "./Features/layerList.vue"

export default {
    name: "MapObject",
    components: {
        VueDraggableResizable,
        GeoMap,
        StatusBar,
        LayerList,
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
        layerList: {
            type: Array,
            default() {
                return []
            },
        },
        itemId: {
            type: String,
            default: "mapObj",
        },
        linkedViewState: {
            type: Array,
        },
    },
    data () {
        return {
            shouldDrag: false,
            redraw: false,
            showLayerList: false,
            width: 700,
            height: 200,
            test: 300,
            x: 0,
            y: 0,
            oldX: 0,
            oldY: 0,
        }
    },
    created() {
    // console.log(this.dx);
        this.x = this.dx
        this.y = this.dy
        this.width = this.dWidth
        this.height = this.dHeight
    /* If dHeight & dWidth are non-zero assign them otherwise use default sizes */
    },
    mounted() {
        this.redraw = !this.redraw
        console.log("LayerList", this.layerList)
        console.log("Line88: ", this.linkedViewState)
    },
    methods: {
        buildNewPosition(){
            if(this.linkedViewState.length == 0){ return null}
            console.log(this.linkedViewState)
            if (this.linkedViewState[2].includes(this.itemId)) {
                return this.linkedViewState[1]
            }
            return null
      
        },
        onResize(x, y, width, height) {
            /* TODO: trigger resize events for children All text should be svg (easy for resizing) */
            this.x = x
            this.y = y
            this.width = width
            this.height = height
        },
        onDrag(x, y) {
            this.oldX = this.x
            this.oldY = this.y
            this.x = x
            this.y = y
        },
        onDragstop() {
            // TODO: update VUEX state for this objects last tracked position
            console.log(
                "line 101: ",
                this.x,
                " ",
                this.y,
                " ",
                this.width,
                " ",
                this.height
            )

            this.$emit(
                "updatePositions",
                {
          
                    dx: this.x,
                    dy: this.y,
                    w: this.width,
                    h: this.height,
                    layerList: [...this.layerList],
                }
            )
            this.x = this.oldX
            this.y = this.oldY
            console.log(
                "line 116: ",
                this.x,
                " ",
                this.y,
                " ",
                this.width,
                " ",
                this.height
            )
        },
        onResizestop() {
            // Update VUEX state to trigger resize of map
            this.redraw = !this.redraw
            this.$emit(
                "updatePositions",
                {
          
                    dx: this.x,
                    dy: this.y,
                    w: this.width,
                    h: this.height,
                    layerList: [...this.layerList],
                }
            )
            console.log("line 120")
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
        toggleLayers() {
            this.showLayerList = !this.showLayerList
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
        selectLinks() {
            this.$emit("selectLinks", this.itemId)
        },
    },
}
</script>
<style media="screen">
.map-handle-tl {
  top: -10px;
  left: -8px;
  cursor: nw-resize;
  border-top-color: black;
  border-top-style: solid;
  border-left-style: solid;
  border-left-color: black;
}

.map-handle-tr {
  top: -10px;
  right: -8px;
  cursor: ne-resize;
  border-top-color: black;
  border-top-style: solid;
  border-right-style: solid;
  border-right-color: black;
}

.map-handle-bl {
  bottom: -10px;
  left: -8px;
  cursor: sw-resize;
  border-bottom-color: black;
  border-bottom-style: solid;
  border-left-style: solid;
  border-left-color: black;
}

.map-handle-br {
  bottom: -10px;
  right: -8px;
  cursor: se-resize;
  border-bottom-color: black;
  border-bottom-style: solid;
  border-right-style: solid;
  border-right-color: black;
}
.map-handle {
  width: 10px;
  height: 10px;
  position: absolute;
  box-sizing: border-box;
}
</style>
<style ,>
.map-container {
  height: 100%;
  /* border: 1px solid black;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px; */
  display: flex;
  flex-direction: column;
}

.vdr {
  position: absolute;
  box-sizing: border-box;
  border: none;
}
</style>
