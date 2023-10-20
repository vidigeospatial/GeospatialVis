<template>
    <div
        id="dashboard-container"
        class="dashboard-container"
    >
        <Splitter
            style="height: 100%"
            @resizeend="resize"
        >
            <SplitterPanel class="leftDashboard">
                <Splitter layout="vertical">
                    <SplitterPanel :size="50">
                        <!-- <SelectFire v-if="fireListStore.isFireListReady" :mapParams="mapParams" /> -->
                        <TabMenu
                            :map-params="SingleFireMapParams"
                            :template-i-d="identifier['mapIdentifier']['Overview']"
                            :preselected="preselected"
                        />
                    </SplitterPanel>
                    <SplitterPanel :size="50">
                        <Splitter layout="horizontal">
                            <SplitterPanel :size="80">
                                <Overview
                                    :map-type="OverviewMapParams.mapType"
                                    :map-i-d="OverviewMapParams.mapID"
                                />
                            </SplitterPanel>
                            <SplitterPanel :size="20">
                                <Layers
                                    v-if="useMapStore.isDataReady(OverviewMapParams.mapID, 'fireClusters')"
                                    :id="OverviewMapParams.mapType"
                                    :map-i-d="OverviewMapParams.mapID"
                                    @updateDeckLayers="updateOverviewMap"
                                />
                            </SplitterPanel>
                        </Splitter>
                    </SplitterPanel>
                </Splitter>
            </SplitterPanel>
            <SplitterPanel
                class="rightDashboard"
                :size="50"
            >
                <SingleFire
                    v-if="load"
                    :map-type="SingleFireMapParams.mapType"
                    :map-i-d="SingleFireMapParams.mapID"
                    :template-i-d="identifier['mapIdentifier']['Overview']"
                    :annotations="SingleFireMapParams.annotations"
                />
            </SplitterPanel>
        </Splitter>
    </div>
</template>

<script lang="ts" setup>
import { provide, ref, computed, onMounted } from 'vue'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import TabMenu from "../Components/editor/TabMenu.vue"
import Layers from "../Components/editor/Layers.vue"
import Overview from "../Components/editor/Overview.vue"
import SingleFire from "../Components/editor/SingleFire.vue"

import { useMap } from "../../store/map"
import { useWildfireList } from "../../store/selectfire"
import identifier from "../../store/localdb/identifiers.json"
import { MAP_RESIZE_KEY, MAP_MODE_KEY } from "@/injectionKeys"

// kind of a hack - but update this ref when the splitter is resized
// Mapbox.vue is watching on this
const updateSize = ref(true)
provide(MAP_RESIZE_KEY, updateSize)
provide(MAP_MODE_KEY, "Viewing")

const resize = () => {
    updateSize.value = !updateSize.value
}

const templateID = identifier.mapIdentifier.Overview
const load = computed(() => fireListStore.validFire[templateID])

const useMapStore = useMap()
const fireListStore = useWildfireList()
fireListStore.fetchFireList()

// Set default values
const props = defineProps({
    OverviewMapParams: {
        type: Object,
        default() {
            return {
                mapType: "overview",
                mapID: "0",
                annotations: []
            }
        }
    },
    SingleFireMapParams: {
        type: Object,
        default(){ 
            return {
                mapType: "single-fire",
                mapID: "1",
                annotations: []
            }
        }
    },
    preselected: {
        type: String,
        default: ""
    }
})

// const smallScreen = ref(false)
// window.addEventListener("resize", debounce(screenSizeChange, 500));

onMounted(() => {
    // screenSizeChange();
})

// function screenSizeChange() {
//   console.log("debounce trigger")
//   if (window.innerWidth <= 1000) {
//     smallScreen.value = true;
//   } else {
//     console.log(window.innerWidth)
//     smallScreen.value = false;
//   }
// }

function updateOverviewMap(parameters) {

}

</script>

<style scoped>
.dashboard-container {
  max-width: none;
  background-color: #e9ecef;
  height: 100%;
  width: 100%;
}

.top-row {
  height: 40%;
}

.bot-row {
  height: 50%;
}

#dashboard-empty {
  margin-top: 40%;
}
</style>
