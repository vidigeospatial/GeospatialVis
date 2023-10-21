<template>
    <div
        id="singleFire-container"
        class="h-full flex flex-col"
    >
        <div
            id="singleFire-label"
            class="label-container"
        >
            <p class="labelStyle">
                Single Fire
            </p>
            <Tooltip
                direction="topRight"
                :description="description"
            />
        </div>
        <div
            id="singleFire-content"
            class="flex-grow"
        >
            <SingleMap v-if="isDataReady" />
            <LoadingScreen v-else />
        </div>
    </div>
</template>

<script lang="ts" setup>
import Tooltip from "./ui/Tooltip.vue"
import SingleMap from "./map/SingleMap.vue"
import LoadingScreen from "./ui/Loading.vue"
import { useWildfireList } from "@/store/selectfire"
import { useMap } from "@/store/map"
import { MAP_PARAMS_KEY, MAP_MODE_KEY } from "@/injectionKeys"
import { onUnmounted, provide, reactive, computed } from 'vue'
import { FireMap, SingleFire } from "@/store/classes/map"

const description = "Single Fire"
const props = defineProps<{
  mapType: string,
  mapID: string,
  templateID: string,
  annotations: any
}>()

const wildfireStore = useWildfireList()
const useMapStore = useMap()
const selectedFire = wildfireStore.fire[props.templateID]

// Call to make a SingleFire mapStore Entry
const [ metaData, viewState ] = useMapStore.getMapStateComponents(props.mapID, props.mapType)
let data = new SingleFire(selectedFire.id, props.annotations)
useMapStore.addDeckMapState(new FireMap(metaData, viewState, data))

const mapParams = reactive({
    mapType: props.mapType,
    mapID: props.mapID,
    templateID: props.templateID,
    fireID: selectedFire.id,
    annotations: props.annotations
})

provide(MAP_PARAMS_KEY, mapParams)

const isDataReady = computed( 
    () => useMapStore.isDataReady(props.mapID, props.mapType, 'perimeter') && 
    useMapStore.isDataReady(props.mapID, props.mapType, 'frp')  &&
    useMapStore.isDataReady(props.mapID, props.mapType, 'roads'))
    // useMapStore.isDataReady(props.mapID, props.mapType, 'wind'))

onUnmounted(() =>{
    // Need to make sure to set this map entry as not active
    useMapStore.deactivateMapState(props.mapType, props.mapID)
    // Set validFire os this template to false
    wildfireStore.validFire[props.templateID] = false
})

</script>

<style scoped>
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
