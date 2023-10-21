<template>
    <div
        id="singleFireTemplate-container"
        class="singleFireTemplate-container"
    >
        <Splitter
            style="height: 100%"
            @resizeend="resize"
        >
            <SplitterPanel :size="15">
                <TabMenu
                    :mapParams="mapParams"
                    :templateID="templateID"
                    :preselected="preselected"
                />
            </SplitterPanel>
            <SplitterPanel>
                <SingleFire
                    v-if="load"
                    :mapType="mapParams.mapType"
                    :mapID="mapParams.mapID"
                    :templateID="templateID"
                    :annotations="mapParams.annotations"
                />
                <NoSingleFire v-else />
            </SplitterPanel>
        </Splitter>
    </div>
</template>

<script lang="ts" setup>
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import { computed, provide, ref, PropType } from "vue"
import NoSingleFire from "../Components/editor/ui/NoSingleFire.vue"
import SingleFire from "../Components/editor/SingleFire.vue"
import TabMenu from "../Components/editor/TabMenu.vue"
import { useWildfireList } from "../../store/selectfire"
import identifier from "@/store/localdb/identifiers.json"
import { MapParamsType } from "@/types/mapTypes"
import FireContentManager from "../Components/editor/map/maputils/project_specific/fire"

import { MAP_MODE_KEY, MAP_RESIZE_KEY, CONTENT_MANAGER_KEY } from "@/injectionKeys"

// kind of a hack - but update this ref when the splitter is resized
// Mapbox.vue is watching on this
const updateSize = ref(true)
provide(MAP_RESIZE_KEY, updateSize)
provide(MAP_MODE_KEY, "Viewing")
provide(CONTENT_MANAGER_KEY, FireContentManager)

const resize = () => {
    updateSize.value = !updateSize.value
}

const fireListStore = useWildfireList()
fireListStore.fetchFireList()

const templateID = identifier.mapIdentifier.Single
const load = computed(() => fireListStore.validFire[templateID])

const props = defineProps({
    mapParams: {
        type: Object as PropType<MapParamsType>,
        default(){ 
            return {
                mapType: "single-fire",
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

</script>

<style scoped>
.singleFireTemplate-container {
    height: 100%;
    width: 100%;
    max-width: none;
    background-color: #e9ecef;
}

</style>
