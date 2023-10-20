<script setup lang="ts">
import DeckGLController from "./maputils/DeckGLController.vue"
import MapboxContainer from "./maputils/MapboxContainer.vue"
import { useMap } from '@/store/map'
import { MAPBOX_SINGLEFIRE_SETTINGS } from './maputils/settings/defaultSettings'
import { useWildfireList } from "@/store/selectfire"
import { inject, ref } from 'vue'
import { MAP_PARAMS_KEY } from "@/injectionKeys"

const useMapStore = useMap()
const wildfireStore = useWildfireList()
const selectedFire = ref()
wildfireStore.$subscribe((mutation, state) => {
    console.log(state.fire)
    selectedFire.value = state.fire
    console.log("From MapSingleFire: selected fire change success!!")

})
const props = defineProps<{
  zoom: number,
}>()

const mapParams = inject(MAP_PARAMS_KEY)

let containername = `map-single-fire-${mapParams.mapID}`
let _MAPBOX_SINGLEFIRE_SETTINGS = { ...MAPBOX_SINGLEFIRE_SETTINGS, container: containername }
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
                :map-style="_MAPBOX_SINGLEFIRE_SETTINGS.style"
                :map-box-settings="_MAPBOX_SINGLEFIRE_SETTINGS"
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
