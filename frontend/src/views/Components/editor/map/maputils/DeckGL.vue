<script setup lang="ts">
import { onMounted, reactive, useAttrs } from 'vue'
import { Deck } from '@deck.gl/core'
import { useMap } from '@/store/map'
import { DECKGL_SETTINGS } from './settings/defaultSettings'
import { vueTileLayer } from "./layers/TileLayer"
import { vueGeoJsonLayer } from './layers/GeoJsonLayer'
import { vueIconLayer } from './layers/IconLayer'
const props = defineProps({
    mapID: { type: String, required: true },
    mapType: { type: String, required: true }
})

const useMapStore = useMap()
const attrs = useAttrs()
let deck: any = null
const emit = defineEmits(['click'])

const layerListDesc = useMapStore.getLayerList(props.mapID, props.mapType)
const currentMapState = useMapStore.getMapStateByID(props.mapID)

console.log("RENDERING OVERVIEW",layerListDesc)
onMounted(() => {

    // Create Layers based on Types
    function generateDeckGLLayers(layerDescription) {
        console.log("GENERATING NEW LAYERS")
        let layerList : any = []
        layerDescription.forEach(element => {
            if (element["type"] == "TileLayer") {
                let tileLayer = new
                vueTileLayer(element["parameters"]["url"], attrs,
                    element["parameters"]["data"])
                layerList.push(tileLayer.create(element["visibility"]))

            } else if (element["type"] == "GeoJSON") {
                if (element["parameters"]["data"] === "OverviewClusters") {
                    let geoData = currentMapState._data.fireClusters.data[0]
                    let geoLayer = new
                    vueGeoJsonLayer(element["parameters"]["url"], attrs,
                        element["parameters"]["data"],
                        geoData) //overviewlayer
                    layerList.push(geoLayer.create(element["visibility"]))

                }
                else if (element["parameters"]['data'] === "FRP_DET") {
                    //DO THE THING
                }

            } else if(element['type'] === 'IconLayer'){
                // const exampleData = [{name: 'Colma (COLM)', address: '365 D Street, Colma CA 94014', exits: 4214, coordinates: [-122.466233, 37.684638]}]
                let iconData = currentMapState._data.selectedFire.data
                console.log("THIS IS THE CURRENT ICON DATA", iconData)
                let iconLayer = new vueIconLayer(element["parameters"]["url"], attrs,
                    element["parameters"]["data"],
                    iconData)
                layerList.push(iconLayer.create(element["visibility"]))
            }

        })
        return layerList

    }
    let layerList = reactive([...generateDeckGLLayers(layerListDesc)])
    // const elevationLayer = new
    //vueTileLayer('https://infovis.cs.ucdavis.edu/mapProxy/wmts/elevation/webmercator/{z}/{x}/{y}.png',
    //attrs)

    deck = new Deck({
        onViewStateChange: ({ viewState }) => handleViewChange(viewState),
        ...DECKGL_SETTINGS,
        ...attrs,
        onClick: (info, event) => emit('click', { info, event }),
        layers: layerList

    })

    useMapStore.$subscribe((mutation, state) => {
        if (mutation.events.key == 'visibility'){
            // console.log("Map State Changed ", state, mutation)
            const updateLayerListDesc = useMapStore.getLayerList(props.mapID, props.mapType)
            layerList = generateDeckGLLayers(updateLayerListDesc)
            deck.setProps({ layers: [...layerList] })
        }
    })

})

function handleViewChange(viewState) {
    //console.log("VIEW STATE CHANGED", viewState)
    //deck.setProps({ viewState: { ...viewState } })
    useMapStore.changeViewState(viewState, props.mapID)

}

</script>

<template>
    <div class="deck-container">
        <slot />
        <canvas id="deck-canvas" />
    </div>
</template>

<style scoped>
#deck-canvas {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 95%;

}

#deckgl-overlay {
    left: 0;

}

.deck-container {
    width: 100%;
    height: 100%;
    position: relative;

}
</style>
