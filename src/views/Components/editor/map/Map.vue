<script setup lang="ts"> 
import DeckGL from "./maputils/DeckGL.vue"
import MapboxContainer from "./maputils/MapboxContainer.vue"
import { useMap } from '../../../../store/map'
import { MAPBOX_OVERVIEW_SETTINGS  } from './maputils/settings/defaultSettings'
// import TileLayer from './maputils/TileLayer.vue'
const useMapStore = useMap()
const props = defineProps<{
      mapID: string,
      mapType: string,
      zoom: number,
    
}>()
</script>

<template>
    <div
        id="map-wrapper"
        class="deck-wrapper"
        :style="{width: '100%', height: '100%'}"
    >
        <DeckGL
            :map-i-d="props.mapID"
            :map-type="props.mapType"
        >
            <MapboxContainer
                :access-token="useMapStore.accessToken"
                :map-style="useMapStore.mapStyle"
                :map-type="props.mapType"
                :map-i-d="props.mapID"
                :map-box-settings="MAPBOX_OVERVIEW_SETTINGS"
            />
        </DeckGL>
    </div>
</template>
<style lang="css">
@import "mapbox-gl/dist/mapbox-gl.css";

p {
  color: black;
}

.deck-container {
  width: 100%;
  height: 100%;
  position: relative;
}
#map {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #e5e9ec;
  overflow: hidden;
}

</style>
