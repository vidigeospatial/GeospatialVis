<template>
    <div
        id="fireComparison-container"
        class="fireComparison-container"
    >
        <Splitter style="height: 100%">
            <SplitterPanel class="leftDashboard">
                <Splitter layout="vertical">
                    <SplitterPanel>
                        <!-- The LEFT ONE --> 
                        <SingleFire
                            v-if="loadLeft"
                            :map-type="leftMapParams.mapType"
                            :map-i-d="leftMapParams.mapID"
                            :template-i-d="leftTemplateID"
                            :annotations="leftMapParams.annotations"
                        />
                    </SplitterPanel>
                    <SplitterPanel>
                        <TabMenu
                            :map-params="leftMapParams"
                            :template-i-d="leftTemplateID"
                            :preselected="leftPreselected"
                        />
                    </SplitterPanel>
                </Splitter>
            </SplitterPanel>
            <SplitterPanel
                class="rightDashboard"
                :size="50"
            >
                <Splitter layout="vertical">
                    <SplitterPanel>
                        <!-- The RIGHT ONE --> 
                        <SingleFire
                            v-if="loadRight"
                            :map-type="rightMapParams.mapType"
                            :map-i-d="rightMapParams.mapID"
                            :template-i-d="rightTemplateID"
                            :annotations="rightMapParams.annotations"
                        />
                    </SplitterPanel>
                    <SplitterPanel>
                        <TabMenu
                            :map-params="rightMapParams"
                            :template-i-d="rightTemplateID"
                            :preselected="rightPreselected"
                        />
                    </SplitterPanel>
                </Splitter>
            </SplitterPanel>
        </Splitter>
    </div>
</template>

<script lang="ts" setup>
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import { computed, provide, PropType } from "vue"
import SingleFire from "../Components/editor/SingleFire.vue"
import TabMenu from "../Components/editor/TabMenu.vue"
import { MapParamsType } from '@/types/mapTypes'
import FireContentManager from '../Components/editor/map/maputils/project_specific/fire'

import * as identifier from "../../store/localdb/identifiers.json"
import { CONTENT_MANAGER_KEY } from '@/injectionKeys'

import { useWildfireList } from "../../store/selectfire"

const fireListStore = useWildfireList()

const leftTemplateID = identifier.mapIdentifier.ComparisonRight
const rightTemplateID = identifier.mapIdentifier.ComparisonLeft

const loadLeft = computed(() => fireListStore.validFire[leftTemplateID])
const loadRight = computed(() => fireListStore.validFire[rightTemplateID])
fireListStore.fetchFireList()

provide(CONTENT_MANAGER_KEY, FireContentManager)

// Set default values
const props = defineProps({
    leftMapParams: {
        type: Object as PropType<MapParamsType> ,
        default() {
            return {
                mapType: "single-fire",
                mapID: "0",
                annotations: []
            }
        }
    },
    rightMapParams: {
        type: Object as PropType<MapParamsType>,
        default(){ 
            return {
                mapType: "single-fire",
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

const mapParams = {
    mapType: "single-fire",
    mapID: "0"
}

const mapParams2 = {
    mapType: "single-fire",
    mapID: "1"
}

</script>

<style scoped>
.fireComparison-container {
    height: 100vh;
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
