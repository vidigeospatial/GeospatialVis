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
                <TabMenuEditor
                    :map-params="mapParams"
                    :template-i-d="templateID"
                    :preselected="preselected"
                />
            </SplitterPanel>
            <SplitterPanel>
                <SingleFire
                    v-if="load"
                    :map-type="mapParams.mapType"
                    :map-i-d="mapParams.mapID"
                    :template-i-d="templateID"
                    :annotations="mapParams.annotations"
                />
                <NoSingleFire v-else />
            </SplitterPanel>
        </Splitter>
    </div>
    <AnnotationEditor
        v-if="showAnnotationEditor"
        :annotation-i-d="annotationID"
        :layer-options="layerOptions"
        :map-params="props.mapParams"
        @close-annotation-editor="closeAnnotationEditor"
        @save-annotation-editor="saveAnnotationEditor"
    />
</template>

<script lang="ts" setup>
import NoSingleFire from "../Components/editor/ui/NoSingleFire.vue"
import SingleFire from "../Components/editor/SingleFire.vue"
import AnnotationEditor from "../Components/editor/ui/AnnotationEditor.vue"
import TabMenuEditor from "../Components/editor/TabMenuEditor.vue"
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import { PropType, ref, provide, computed, watch, onMounted, Ref, Prop } from "vue"

import { useWildfireList } from "../../store/selectfire"
// import { useEditor } from "../../store/editor"
import { useMap } from '../../store/map'
import { SingleFire as SingleFireType } from "@/store/classes/map"
import { MapState } from "@/types/mapTypes"

import { MapParamsType } from "@/types/mapTypes"

import { MAP_RESIZE_KEY, MAP_EDITOR_KEY, MAP_MODE_KEY, CONTENT_MANAGER_KEY } from "@/injectionKeys"

import identifier from "@/store/localdb/identifiers.json"
import FireContentManager from "../Components/editor/map/maputils/project_specific/fire"

// kind of a hack - but update this ref when the splitter is resized
// Mapbox.vue is watching on this
const updateSize = ref(true)
provide(MAP_RESIZE_KEY, updateSize)
provide(MAP_MODE_KEY, "Editing")
provide(CONTENT_MANAGER_KEY, FireContentManager)

const resize = () => {
    updateSize.value = !updateSize.value
}

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

const fireListStore = useWildfireList()
fireListStore.fetchFireList()

const useMapStore = useMap()
const useEditorStore = useEditor()

const showAnnotationEditor = ref(false)
const annotationID = ref(0)
const layerOptions: Ref<MapState.Layer<any>[]> = ref(null)


const closeAnnotationEditor = () => {
    useEditorStore.currentlyEditingAnnotation = false
    showAnnotationEditor.value = false
}
const saveAnnotationEditor = () => {
    useEditorStore.currentlyEditingAnnotation = false
    showAnnotationEditor.value = false
}

const templateID = identifier['mapIdentifier']['Single']
const load = computed(() => fireListStore.validFire[templateID])

watch(() => useMapStore.mapStateExists(props.mapParams.mapID, props.mapParams.mapType), (val) => {
    // If a map is added to the mapstore, add it to the editor store as well
    // if (val) {
    //     let mapStateIDX = useMapStore.findActiveIDX(props.mapParams.mapID, props.mapParams.mapType)
    //     let singleFireMap = useMapStore.deckGLMapState[mapStateIDX]._data
    //     if (singleFireMap instanceof SingleFireType) {
    //         let fireID = singleFireMap.fireID
    //         let newSlideState = useEditorStore.getSlideState(currentlyEditingSlideID)
    //         newSlideState['fire_id'] = fireID
    //         newSlideState['annotations'] = []
    //         useEditorStore.setSlideState(currentlyEditingSlideID, newSlideState)

    //     }
    // }
})

// If an annoation is marked to be edited, open the AnnotationEditor
watch(useEditorStore.editingAnnotation, (val) => {
    if (val){
        console.log("in watch for editingAnnotation")
        layerOptions.value = useMapStore.getLayerList(props.mapParams.mapID, props.mapParams.mapType)
        annotationID.value = useEditorStore.annotationToEdit.annotationID
        showAnnotationEditor.value = true
    }
})

/*
watch(useEditorStore.slideState[currentlyEditingSlideID], (val) => {
    // If the slide state changes, update the map state (targeting annotations)
    if (val.annotations){
        console.log('adding', val.annotations)
        let idx = useMapStore.findActiveSingleFireIDX(props.mapParams.mapID)
        useMapStore.deckGLMapState[idx]._data.annotations = val.annotations;
    }
})
*/

onMounted(() =>{
    //const { mapStateExists } = storeToRefs(useMapStore) 

})
</script>

<style scoped>
.singleFireTemplate-container {
    height: 100%;
    width: 100%;
    max-width: none;
    background-color: #e9ecef;
}

.singleFireContent {
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
../../../../../@deprecated/editor