<template>
    <div
        id="label"
        class="label-container"
    >
        <p class="labelStyle">
            Layer Selection
        </p>
        <Tooltip
            direction="topRight"
            :description="description"
        />
    </div>
    <div
        v-if="isActive"
        id="display-area"
        class="selectlayer-container"
    >
        <div class="col">
            <h1>Options</h1>
            <draggable
                v-model="optionsList"
                ghost-class="on-drag"
                :sort="false"
                :group="{ name: 'layers', pull: 'clone', put: false }"
                item-key="name"
                animation="400"
            >
                <template #item="{ element }">
                    <LayerCard :element="element" />
                </template>
            </draggable>
        </div>

        <div class="col">
            <h1>Active Layers</h1>
            <draggable
                v-model="activeList"
                :group="{
                    name: 'layers', pull: true, put: (to, from, dragEl, event) => {
                        return !Array.from(to.el.children).map(d => d.getAttribute('dataID')).includes(dragEl.getAttribute('dataID'));
                    }
                }"
                :onAdd="onAdd"
                :sort="false"
                :onRemove="onRemove"
                ghost-class="on-drag"
                item-key="name"
                animation="400"
            >
                <template #item="{ element }">
                    <LayerCard :element="element" />
                </template>
            </draggable>
        </div>

        <div class="col-trash">
            <h1>Trash</h1>
            <draggable
                v-model="trashList"
                ghost-class="on-drag"
                :group="{ name: 'trash', pull: false, put: true }"
                item-key="name"
                animation="400"
            >
                <template #item="{ element }">
                    <LayerCard
                        class="trash-element"
                        :element="element"
                    />
                </template>
            </draggable>
        </div>
    </div>
    <div v-else>
        Found no active map
    </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, watch, inject, PropType, onMounted } from 'vue'
import draggable from "vuedraggable"
import { useMap } from "@/store/map"
import LayerCard from './ui/LayerCard.vue'
import Tooltip from "./ui/Tooltip.vue"
import { MapParamsType, MapState } from "@/types/mapTypes"
import { MAP_RESIZE_KEY } from '@/injectionKeys'

const props = defineProps<{
    mapParams: MapParamsType
}>()

const mapStore = useMap()
const isActive = ref(mapStore.findActiveIDX(props.mapParams.mapID, props.mapParams.mapType) != -1)

const description = "Select Map Layers"
const flexDirection = ref("column")

const mapSizeUpdate = inject(MAP_RESIZE_KEY)

onMounted(() => {
    nextTick(() => {
        watch(mapSizeUpdate, () => {
            document.getElementById("display-area").clientWidth > document.getElementById("display-area").clientHeight ? flexDirection.value = "row" : flexDirection.value = "column"
        }, { immediate: true })
    })
})

let layerList: MapState.Layer<any>[]

let activeList; let optionsList; let trashList
let activeMapIDX

if (isActive.value) {
    activeMapIDX = mapStore.findActiveIDX(props.mapParams.mapID, props.mapParams.mapType)
    layerList = mapStore.deckGLMapState[activeMapIDX]._data.layerList
    // console.log('I AM LOOKING AT ', props.mapParams.mapID)
    // layerList = reactive([...layerListDesc]);

    activeList = ref(mapStore.deckGLMapState[activeMapIDX]._data.layerList.filter(e => e.visibility))
    optionsList = ref(mapStore.deckGLMapState[activeMapIDX]._data.layerList)
    trashList = ref([])
}

function onAdd(evt) {
    let mapState = mapStore.deckGLMapState[activeMapIDX]
    let toAdd = evt.item.getAttribute('dataID')
    let idx = layerList.findIndex((layer) => layer.name == toAdd)
    layerList[idx].visibility = true
    /*
    let newLayerList = mapState._data.layerList.map(d => {if (d.name == toAdd) { d.visibility = true; return d; } else { return d; }})
    mapState._data.layerList = newLayerList
    mapStore.updateGLMapState(activeSingleMapID, mapState)
    */
}

function onRemove(evt) {
    let mapState = mapStore.deckGLMapState[activeMapIDX]
    let toRemove = evt.item.getAttribute('dataID')
    let idx = layerList.findIndex((layer) => layer.name == toRemove)
    layerList[idx].visibility = false

    /*
    mapStore.deckGLMapState.forEach((mapState) => {
        mapState._data.layerList.forEach(d => console.log(d.name, d.visibility));
    })
    
    let newLayerList = mapState._data.layerList.map(d => {if (d.name == toRemove) { d.visibility = false; return d; } else { return d; }})
    mapState._data.layerList = newLayerList
    mapStore.updateGLMapState(activeSingleMapID, mapState)
    */
}

</script>

<style scoped>
.on-drag {
  border: indianred;
  border-style: solid;
  z-index: 10;
}

.col {
  flex: 2;
}

.col-trash {
  flex: 1;
}

.trash-element {
  display: none;
}

#display-area {
  display: flex;
  flex-direction: v-bind('flexDirection');
  justify-content: space-evenly;
  height: 94%;
  width: 100%;
}

.labelStyle {
  font-family: "Lato";
  color: black;
  display: flex;
  margin: 0;
  font-weight: 100;
  font-size: 0.75em;
  padding: 5px;
}

.label-container {
  position: relative;
  display: flex;
  background-color: #f8f9fa;
}
</style>
