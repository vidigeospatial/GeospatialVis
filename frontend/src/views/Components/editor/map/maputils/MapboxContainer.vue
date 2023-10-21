<script setup lang="ts">
//import { MAPBOX_OVERVIEW_SETTINGS, MAPBOX_DETAIL_SETTINGS } from './settings/defaultSettings'
import { inject, onMounted, useAttrs, watch } from 'vue'
import * as mapboxgl from "mapbox-gl"
import { useMap } from '@/store/map'

import { MAP_PARAMS_KEY, MAP_RESIZE_KEY } from "@/injectionKeys"

// on splitter resize, updateSize will be updated
const update = inject(MAP_RESIZE_KEY)
const mapParams = inject(MAP_PARAMS_KEY)

const props = defineProps<{
    accessToken: string,
    mapStyle?: string,
    mapBoxSettings: Object
}>()

let map: any = null
const attrs = useAttrs()
const useMapStore = useMap()

//let defaultSettings: any = (props.mapType.includes("overview")) ? MAPBOX_OVERVIEW_SETTINGS : MAPBOX_DETAIL_SETTINGS;

onMounted(() => {
    // console.log("Access Token", props.accessToken)
    console.log("mapbox obj", mapboxgl)
    map = new mapboxgl.Map({
        ...props.mapBoxSettings,
        ...attrs,
        style: props.mapStyle,
        accessToken: props.accessToken,
        container: `map-${mapParams.mapType}-${mapParams.mapID}`
    })
    map.on('style.load', () => {
        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        })
        // add the DEM source as a terrain layer with exaggerated height
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 })
    })

    map.on('load', function() {
        map.resize()
    })
    watch(update, () => {
        map.resize()
    }, { immediate: true })

    // Use a watcher to track when the target map state changes
    const watchedIndex = useMapStore.deckGLMapState.findIndex((map) => map._metaData.id === mapParams.mapID && map._metaData.mType == mapParams.mapType && map._metaData.active)  //._viewState
    handleMapChange(useMapStore.deckGLMapState[watchedIndex]._viewState)
    watch(useMapStore.deckGLMapState[watchedIndex]._viewState, (newVal) => {
        // Update this map's view state
        handleMapChange(newVal)
    })
})

function handleMapChange(viewState) {
    map.jumpTo({
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        bearing: viewState.bearing,
        pitch: viewState.pitch,
    })
}

</script>

<template>
    <div
        :id="`map-${mapParams.mapType}-${mapParams.mapID}`"
        :ref="`map-${mapParams.mapType}-${mapParams.mapID}`"
        class="mapboxMap w-full h-full absolute top-0 left-0"
    />
</template>

<style lang="css">
@import "mapbox-gl/dist/mapbox-gl.css";

p {
    color: black;
}

.mapboxMap {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #e5e9ec;
    overflow: hidden;
}
</style>
