<template>
    <Splitter style="height: 95%">
        <SplitterPanel
            :size="33"
            :minSize="10"
        > 
            <Splitter
                style="height: 100%"
                layout="vertical"
            >
                <SplitterPanel
                    :size="33"
                    :minSize="10"
                >
                    <SingleWater
                        :mapType="props.parentMapParams.mapType + 'SM'"
                        mapID="1"
                        :annotations="props.parentMapParams.annotations"
                        :SM="true"
                    />
                </SplitterPanel>
                <SplitterPanel
                    :size="33"
                    :minSize="10"
                >
                    TEMP
                </SplitterPanel>
                <SplitterPanel
                    :size="33"
                    :minSize="10"
                >
                    <SingleWater
                        :mapType="props.parentMapParams.mapType + 'SM'"
                        mapID="4"
                        :annotations="props.parentMapParams.annotations"
                        :SM="true"
                    />
                </SplitterPanel>
            </Splitter>
        </SplitterPanel>
        <SplitterPanel
            :size="33"
            :minSize="10"
        >
            <Splitter
                style="height: 100%"
                layout="vertical"
            >
                <SplitterPanel
                    :size="33"
                    :minSize="10"
                >
                    <SingleWater
                        :mapType="props.parentMapParams.mapType + 'SM'"
                        mapID="2"
                        :annotations="props.parentMapParams.annotations"
                        :SM="true"
                    />
                </SplitterPanel>
                <SplitterPanel
                    :size="33"
                    :minSize="10"
                >
                    <SingleWater
                        :mapType="props.parentMapParams.mapType + 'SM'"
                        mapID="0"
                        :annotations="props.parentMapParams.annotations"
                        :SM="true"
                    />
                </SplitterPanel>
                <SplitterPanel
                    :size="33"
                    :minSize="10"
                >
                    <SingleWater
                        :mapType="props.parentMapParams.mapType + 'SM'"
                        mapID="5"
                        :annotations="props.parentMapParams.annotations"
                        :SM="true"
                    />
                </SplitterPanel>
            </Splitter>
        </SplitterPanel>
        <SplitterPanel
            :size="33"
            :minSize="10"
        >
            <Splitter
                style="height: 100%"
                layout="vertical"
            >
                <SplitterPanel
                    :size="33"
                    :minSize="10"
                >
                    <SingleWater
                        :mapType="props.parentMapParams.mapType + 'SM'"
                        mapID="3"
                        :annotations="props.parentMapParams.annotations"
                        :SM="true"
                    />
                </SplitterPanel>
                <SplitterPanel
                    :size="33"
                    :minSize="10"
                >
                    Panel 8
                </SplitterPanel>
                <SplitterPanel
                    :size="33"
                    :minSize="10"
                >
                    <SingleWater
                        :mapType="props.parentMapParams.mapType + 'SM'"
                        mapID="6"
                        :annotations="props.parentMapParams.annotations"
                        :SM="true"
                    />
                </SplitterPanel>
            </Splitter>
        </SplitterPanel>
    </Splitter>
</template>

<script setup lang="ts">
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import SingleWater from "./SingleWater.vue"
import { MapParamsType } from '@/types/mapTypes'
import { useSmallMultiples } from '@/store/smallMultiples'
import { useMap } from '@/store/map'
import { onMounted, watch, ref, nextTick, provide, computed } from 'vue'
import { MAP_VIEWSTATE_KEY, MAP_TIME_KEY } from '@/injectionKeys'

const props = defineProps<{
    parentMapParams: MapParamsType
    SMTime: string[]
}>()



const useMapStore = useMap()
const mapViewState = ref({ latitude: 0, longitude: 0, zoom: 0, pitch: 0, bearing: 0 })
const mapTime = ref(0)

let mapStatelen = useMapStore.deckGLMapState.length
const allSMLoaded = computed( () => useMapStore.deckGLMapState.length === mapStatelen + 7 && useMapStore.deckGLMapState[mapStatelen + 7 - 1]._viewState)
watch(allSMLoaded, (newVal) => {
    if (!newVal)
        return
    let SMMapsIDX = []
    const parentMapIDX = useMapStore.findActiveIDX(props.parentMapParams.mapID, props.parentMapParams.mapType)
    for (let i = 0; i <= 6; i++) { SMMapsIDX.push(useMapStore.findActiveIDX(i.toString(), props.parentMapParams.mapType + 'SM')) }

    // If the parent viewstate changes, change the center small multiples viewstate - this one mirrors the parent
    watch(() => useMapStore.deckGLMapState[parentMapIDX]._data.currentTime, (newVal) => {
        useMapStore.deckGLMapState[useMapStore.findActiveIDX('0', props.parentMapParams.mapType + 'SM')]._data.currentTime = newVal
    })

    SMMapsIDX.forEach((i, index) => {
        // // Set the time of the small multiples to the one assigned via SMTime
        // useMapStore.deckGLMapState[i]._data.currentTime = new Date(props.SMTime[index]).getTime()

        // If the parent layer list changes, change the small multiples layer list
        watch([useMapStore.deckGLMapState[parentMapIDX]._data.layerList, useMapStore.deckGLMapState[parentMapIDX]._viewState], ([newLL, newViewState]) => {
            useMapStore.deckGLMapState[i]._data.layerList = newLL
            useMapStore.changeViewStateIDX(i, newViewState)
        }) 

        watch(useMapStore.deckGLMapState[i]._viewState, (newVal) => {
            SMMapsIDX.forEach( i => {
                useMapStore.changeViewStateIDX(i, newVal)
            } )
        })

    })

    SMMapsIDX.slice(1,).forEach((i, index) => {
        useMapStore.deckGLMapState[i]._data.currentTime = new Date(props.SMTime[index]).getTime()
    })
    console.log(useMapStore.deckGLMapState)
})

const useSmallMultiplesStore = useSmallMultiples()
useSmallMultiplesStore.setParentMapParams(props.parentMapParams)
useSmallMultiplesStore.initializeMapParamsList()

// onMounted(() => {
//     let SMMapsIDX = []
//     const parentMapIDX = useMapStore.findActiveIDX(props.parentMapParams.mapID, props.parentMapParams.mapType)
//     SMMapsIDX.push(parentMapIDX)
//     console.log('HERE', parentMapIDX)
//     for (let i = 0; i <= 6; i++) {
//         SMMapsIDX.push(useMapStore.findActiveIDX(i.toString(), props.parentMapParams.mapType + 'SM'))
//         console.log(SMMapsIDX, 'i')
//     }
//     console.log(SMMapsIDX)
//     nextTick(() => {
//         SMMapsIDX.forEach(i => {
//             watch(useMapStore.deckGLMapState[parentMapIDX]._data.layerList, (newVal) => {
//                 console.log('Updating layer list', i.toString(), props.parentMapParams.mapType + 'SM')
//                 // useMapStore.updateLayerListState(newVal, i.toString(), props.parentMapParams.mapType + 'SM')
//                 useMapStore.deckGLMapState[i]._data.layerList = newVal
//             })
//             watch(useMapStore.deckGLMapState[i]._viewState, (newVal) => {
//                 console.log(newVal)
//                 mapViewState.value = newVal
//                 // mapViewState.value = { latitude: 0, longitude: 0, zoom: 0, pitch: 0, bearing: 0 }
//             })
//         })
//     })
//     console.log(useMapStore.deckGLMapState)
// })

</script>

<style scoped>

</style>

