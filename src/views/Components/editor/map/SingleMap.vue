
<script setup lang="ts"> 
import DeckGLController from "./maputils/DeckGLController.vue"
import MapboxContainer from "./maputils/MapboxContainer.vue"
import { useMap } from '@/store/map'
import { MAPBOX_SINGLEFIRE_SETTINGS  } from './maputils/settings/defaultSettings'
import { ref, inject  } from 'vue'
import { MAP_PARAMS_KEY } from "@/injectionKeys"
const useMapStore = useMap()

const mapParams = inject(MAP_PARAMS_KEY)

let containername = `map-${mapParams.mapType}-${mapParams.mapID}`
let _MAPBOX_SETTINGS = { ...MAPBOX_SINGLEFIRE_SETTINGS, container: containername }
</script>

<template>
    <div
        id="map-wrapper"
        class="deck-wrapper"
        :style="{ width: '100%', height: '100%' }"
    >
        <DeckGLController>
            <MapboxContainer
                :access-token="useMapStore.accessToken"
                :map-style="_MAPBOX_SETTINGS.style"
                :map-box-settings="_MAPBOX_SETTINGS"
            />
        </DeckGLController>
    </div>
</template>
<style lang="css">
@import "mapbox-gl/dist/mapbox-gl.css";
p {
  color: black;
}

#map-wrapper {
    display: flex;
    flex-flow: column;
}

</style>