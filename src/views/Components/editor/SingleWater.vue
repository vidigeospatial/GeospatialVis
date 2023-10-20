<template>
    <div
        id="singleWater-container"
        class="h-full flex flex-col"
    >
        <div
            id="singleWater-label"
            class="label-container"
        >
            <p class="labelStyle">
                Water
            </p>
            <Tooltip
                direction="topRight"
                :description="description"
            />
        </div>
        <div
            id="singleWater-content"
            class="flex-grow"
        >
            <SingleMap />
        </div>
    </div>
</template>

<script lang="ts" setup>


import Tooltip from "./ui/Tooltip.vue"
import SingleMap from "./map/SingleMap.vue"
import { useMap } from "@/store/map"
import { provide, reactive, onUnmounted, onMounted } from 'vue'
import { MAP_PARAMS_KEY } from "@/injectionKeys"
import { Water, WaterMap } from "@/store/classes/map"

const description = "Single Water"
const props = defineProps<{
  mapType: string,
  mapID: string,
  // templateID: string,
  annotations: any,
  SM: boolean
}>()

const useMapStore = useMap()

// Call to make a SingleFire mapStore Entry
// Use a temporary waterID for now
const [ metaData, viewState ] = useMapStore.getMapStateComponents(props.mapID, props.mapType)
let data = new Water(props.annotations)
useMapStore.addDeckMapState(new WaterMap(metaData, viewState, data))

const mapParams = reactive({
    mapType: props.mapType,
    mapID: props.mapID,
    templateID: "",
    fireID: "",
    annotations: props.annotations,
    SM: props.SM
})

provide(MAP_PARAMS_KEY, mapParams)

onUnmounted(() =>{
    // Need to make sure to set this map entry as not active
    useMapStore.deactivateMapState(props.mapType, props.mapID)
    // Set validFire os this template to false
    // wildfireStore.validFire[props.templateID] = false
})



</script>

<style scoped>
.singleWater-container {
  height: 100%;
  background-color: #f8f9fa;
  box-shadow: rgb(0 0 0 / 15%) 1.95px 1.95px 2.6px;
}

.singleFireContent {
  height: 100%;
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
}

.iconContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}

.infoIcon {
  color: #b0b2b5;
  font-size: 0.65em;
}
</style>
