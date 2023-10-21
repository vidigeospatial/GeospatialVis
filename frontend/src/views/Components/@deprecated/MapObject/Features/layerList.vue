<template>
    <div
        v-if="listReady"
        :id="layerListID"
        :class="layerClasses"
        @drop="onDrop($event, 1)"
        @dragover.prevent
        @dragenter.prevent
    >
        <h1 class="layerHeading">
            Layers
        </h1>
        <div
            v-for="element in localLayerList"
            id="layerList"
            :key="element.id"
            class="layerElement"
            draggable
            @dragstart="startDrag($event, element)"
            @dragover="draggedOver($event, element)"
            @click="toggleVisible($event, element)"
        >
            <p class="layerName">
                <i :class="toggleVisibleClass" />
                {{ element.name }}
                <i class="fas fa-sliders-h settings" />
            </p>
        </div>
    </div>
</template>

<script>
import { bus } from "../../../../index"

export default {
    name: "LayerList",
    components: {},
    props: {
        revealList: {
            type: Boolean,
            default: false,
        },
        layerList: {
            type: Array,
            default() {
                return []
            },
        },
        layerID: {
            type: String,
            default: "mapObj",
        },
    },
    data() {
        return {
            listReady: false,
            layerClasses: ["listContainer"],
            localLayerList: [],
            layerListID: "",
            toggleVisibleClass: ["fas", "fa-eye", "visibility"],
            draggedOverElement: null,
            draggedElement: null,
        }
    },
    watch: {
        revealList() {
            this.toggleSlide()
        },
    },
    created() {
        this.localLayerList = this.layerList
        console.log("LayerID", this.layerID)
        console.log("localLayerList", this.localLayerList)
        this.layerListID = this.layerID + "-layer"
        this.listReady = true
    },
    mounted() {
        this.toggleSlide()
    },
    methods: {
        toggleSlide() {
            if (this.layerClasses.includes("openList")) {
                this.layerClasses = this.layerClasses.filter(function(e) {
                    return e !== "openList"
                })
            } else {
                this.layerClasses.push("openList")
            }
        },
        startDrag: (evt, item) => {
            evt.dataTransfer.dropEffect = "move"
            evt.dataTransfer.effectAllowed = "move"
            evt.dataTransfer.setData("itemID", item.id)
        },
        onDrop(evt, list) {
            const itemID = evt.dataTransfer.getData("itemID")
            const item = this.localLayerList.find((item) => item.id == itemID)
            const curIndex = this.localLayerList.map((e) => e.id).indexOf(item.id)
            const tarIndex = this.localLayerList
                .map((e) => e.id)
                .indexOf(this.draggedOverElement.id)

            this.$set(this.localLayerList, curIndex, this.localLayerList[tarIndex])
            this.$set(this.localLayerList, tarIndex, item)
        },
        draggedOver(evt, val) {
            this.draggedOverElement = val
        },
        toggleVisible(event, item) {
            console.log(event)
            if (event.srcElement.classList.contains("fa-eye")) {
                event.srcElement.classList.remove("fa-eye")
                event.srcElement.classList.add("fa-eye-slash")
                if (item.name == "Perimeter") {
                    bus.$emit("PerimeterStatus", [this.layerID, false])
                } else if (item.name == "Satellite") {
                    bus.$emit("SatelStatus", [this.layerID, false])
                }
            } else {
                event.srcElement.classList.remove("fa-eye-slash")
                event.srcElement.classList.add("fa-eye")
                if (item.name == "Perimeter") {
                    bus.$emit("PerimeterStatus", [this.layerID, true])
                } else if (item.name == "Satellite") {
                    bus.$emit("SatelStatus", [this.layerID, true])
                }
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.listContainer {
  height: 100%;
  width: 35%;
  background-color: #0f1e2ab5;
  box-shadow: rgb(15 30 42) 0px 0px 22px inset;
  overflow-y: scroll;
  position: absolute;
  top: 0;
  left: 100%;
  max-width: 0;
  transition: max-width 0.5s ease-in-out;
}

.openList {
  max-width: 153px;
  transition: max-width 0.5s ease-in-out;
}

.layerElement {
  background-color: #63878ccc;
  color: #dee3e4;
  font-family: Lato;
  -webkit-box-shadow: rgb(0 0 0 / 50%) 0px 0px 1px inset;
  box-shadow: rgb(255 255 255 / 50%) 0px 0px 1px inset;
  padding: 1%;
}

.layerElement:hover {
  background-color: #8bb6bd;
  color: #dffaff;
}

.listContainer::-webkit-scrollbar-track {
  border: 1px solid #000;
  padding: 2px 0;
  background-color: #4c575f;
}

.listContainer::-webkit-scrollbar {
  width: 10px;
}

.listContainer::-webkit-scrollbar-thumb {
  border-radius: 3px;
  -webkit-box-shadow: inset 0 0 6px rgb(44 74 78);
  box-shadow: inset 0 0 6px rgb(44 74 78);
  background-color: #b2c0c2;
  border: 1px solid #000;
}

.layerHeading {
  font-size: 122%;
  // padding: 0.8%;
  margin: 0;
  color: white;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-bottom-color: #9d9d9d;
  background-color: #171e20;
}

.settings {
  position: relative;
  float: right;
  margin: 1%;
}

.visibility {
  position: relative;
  float: left;
  margin: 1%;
}

p.layerName {
  margin: 0;
}
</style>
