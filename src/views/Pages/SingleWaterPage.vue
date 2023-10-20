<template>
    <div class="singleWaterTemplate-container">
        <Splitter
            v-show="!showSM"
            style="height: 100%"
            @resizeend="resize"
        >
            <SplitterPanel
                :size="15"
            >
                <TabMenuWater
                    :mapParams="mapParams"
                    :templateID="templateID"
                    :preselected="preselected"
                />
            </SplitterPanel>
            <SplitterPanel>
                <SingleWater
                    :mapType="mapParams.mapType"
                    :mapID="mapParams.mapID"
                    :annotations="mapParams.annotations"
                    :SM="false"
                />
            </SplitterPanel>
        </Splitter>
        <!-- <SmallMultiples
            v-show="showSM"
            style="height: 100%"
            :parent-map-params="$props.mapParams"
            :SMTime="SMTime"
        /> -->
        <!-- <Menubar :model="items" /> -->
    </div>
</template>

<script lang="ts" setup>
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import Menubar from 'primevue/menubar'
import { useRoute } from 'vue-router'
import { provide, ref, PropType, nextTick } from "vue"
import SingleWater from "../Components/editor/SingleWater.vue"
import TabMenuWater from "../Components/editor/TabMenuWater.vue"
import identifier from "@/store/localdb/identifiers.json"
import { CONTENT_MANAGER_KEY, MAP_RESIZE_KEY, MAP_MODE_KEY } from "@/injectionKeys"
import WaterContentManger from "../Components/editor/map/maputils/project_specific/water"
// import SmallMultiples from '../Components/editor/SmallMultiples.vue'
import { MapParamsType } from '@/types/mapTypes'

const templateID = identifier.mapIdentifier.Single

// kind of a hack - but update this ref when the splitter is resized
// Mapbox.vue is watching on this
const showSM = ref(false)
const updateSize = ref(true)
const SMTime = ref(['1/1/1925', '8/22/1933', '1/1/1965', '1/1/1990', '1/1/2010', '1/1/2020'])
provide(MAP_RESIZE_KEY, updateSize)
provide(CONTENT_MANAGER_KEY, WaterContentManger)
provide(MAP_MODE_KEY, "Viewing")

const resize = () => {
    updateSize.value = !updateSize.value
}

const props = defineProps({
    mapParams: {
        type: Object as PropType<MapParamsType>,
        default(){ 
            return {
                mapType: "single-water",
                mapID: "0",
                annotations: []
            }
        }
    },
    preselected: {
        type: String,
        default: ""
    }
})

const items = ref([
    {
        label: 'Temporal SM',
        icon: 'pi pi-fw pi-exclamation-triangle',
        command: () => {
            showSM.value = !showSM.value
            nextTick(() => {
                updateSize.value = !updateSize.value
            })
            // updateSize.value = !updateSize.value
            console.log("Temporal SM")
        }
    }
])

</script>

<style scoped>
.singleWaterTemplate-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    max-width: none;
    background-color: #e9ecef;
}
.overflow {
    overflow: scroll;
}


</style>
