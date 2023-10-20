<template>
    <div
        id="fireComparison-container"
        class="fireComparison-container"
    >
        <Splitter
            style="height: 100%"
            @resizeend="resize"
        >
            <SplitterPanel class="leftDashboard">
                <Splitter layout="vertical">
                    <SplitterPanel :size="1">
                        <TabMenuWater
                            :mapParams="LeftMapParams"
                            :templateID="leftTemplateID"
                            :preselected="leftPreselected"
                        />
                    </SplitterPanel>
                    <SplitterPanel>
                        <SingleWater
                            :map-type="LeftMapParams.mapType"
                            :map-i-d="LeftMapParams.mapID"
                            :template-i-d="leftTemplateID"
                            :annotations="LeftMapParams.annotations"
                            :SM="false"
                        />
                    </SplitterPanel> 
                </Splitter>
            </SplitterPanel>
            <SplitterPanel
                class="rightDashboard"
                :size="50"
            >
                <Splitter layout="vertical">
                    <SplitterPanel :size="5">
                        <TabMenuWater
                            :mapParams="RightMapParams"
                            :templateID="rightTemplateID"
                            :preselected="rightPreselected"
                        />
                    </SplitterPanel>
                    <SplitterPanel>
                        <SingleWater
                            :map-type="RightMapParams.mapType"
                            :map-i-d="RightMapParams.mapID"
                            :template-i-d="rightTemplateID"
                            :annotations="RightMapParams.annotations"
                            :SM="false"
                        />
                    </SplitterPanel>
                </Splitter>
            </SplitterPanel>
        </Splitter>
    </div>
    <div class="flex justify-center items-center  fixed bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white px-4 rounded-md z-10">
        <!-- Your timebar content goes here -->
        Map Controls: 
        <div class="card flex justify-content-center">
            <ToggleButton 
                v-model="isSyncMap" 
                on-label="Map Viewport Synced" 
                off-label="Viewport Sync Off" 
            />
        </div>
        <div class="card flex justify-content-center">
            <ToggleButton 
                v-model="isSyncTime" 
                on-label="Map Time Synced" 
                off-label="Time Sync Off" 
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import ToggleButton from 'primevue/togglebutton'
import { PropType, onMounted, ref, watch, provide } from "vue"
import SingleWater from "../Components/editor/SingleWater.vue"
import TabMenuWater from "../Components/editor/TabMenuWater.vue"
import { MAP_MODE_KEY, MAP_RESIZE_KEY, CONTENT_MANAGER_KEY } from "@/injectionKeys"
import type { MapParamsType } from '@/types/mapTypes'
import WaterContentManger from "../Components/editor/map/maputils/project_specific/water"
import { useMap } from '@/store/map'

import * as identifier from "../../store/localdb/identifiers.json"

// const fireListStore = useWildfireList()

const updateSize = ref(true)
provide(MAP_RESIZE_KEY, updateSize)

const resize = () => {
    updateSize.value = !updateSize.value
}

const useMapStore = useMap()

// const leftTemplateID = identifier.mapIdentifier.FireComparisonRight
const leftTemplateID = identifier.mapIdentifier.ComparisonRight
const rightTemplateID = identifier.mapIdentifier.ComparisonLeft

const isSyncMap = ref(false)
const isSyncTime = ref(false)

// const loadLeft = computed(() => fireListStore.validFire[leftTemplateID])
// const loadRight = computed(() => fireListStore.validFire[rightTemplateID])

// fireListStore.fetchFireList()
provide(CONTENT_MANAGER_KEY, WaterContentManger)

// Set default values
const props = defineProps({
    LeftMapParams: {
        type: Object as PropType<MapParamsType>,
        default() {
            return {
                mapType: "single-water",
                mapID: "0",
                annotations: []
            }
        }
    },
    RightMapParams: {
        type: Object as PropType<MapParamsType>,
        default(){ 
            return {
                mapType: "single-water",
                mapID: "1",
                annotations: []
            }
        }
    },
    leftPreselected: {
        type: String,
        default: ""
    },
    rightPreselected: {
        type: String,
        default: ""
    }
})

onMounted(() => {
    const watchedIndexLeft = useMapStore.findActiveIDX(props.LeftMapParams.mapID, props.LeftMapParams.mapType)
    const watchedIndexRight = useMapStore.findActiveIDX(props.RightMapParams.mapID, props.RightMapParams.mapType)
    watch(useMapStore.deckGLMapState[watchedIndexLeft]._viewState, (leftViewState) => {
        if (isSyncMap.value) {
            useMapStore.changeViewStateIDX(watchedIndexRight, leftViewState)
        }
    })
    watch(useMapStore.deckGLMapState[watchedIndexRight]._viewState, (rightViewState) => {
        if (isSyncMap.value) {
            useMapStore.changeViewStateIDX(watchedIndexLeft, rightViewState)
        }
    })
    watch(() => useMapStore.deckGLMapState[watchedIndexLeft]._data.currentTime, (leftTime) => {
        if (isSyncTime.value) {
            useMapStore.changeTimeIDX(watchedIndexRight, leftTime)
        }
    })
    watch(() => useMapStore.deckGLMapState[watchedIndexRight]._data.currentTime, (rightTime) => {
        if (isSyncTime.value) {
            useMapStore.changeTimeIDX(watchedIndexLeft, rightTime)
        }
    })
})


</script>

<style scoped>
.fireComparison-container {
    height: 100%;
    width: 100%;
    max-width: none;
    background-color: #e9ecef;
}

.fireComparisonContent {
    height: 97.5%;
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
