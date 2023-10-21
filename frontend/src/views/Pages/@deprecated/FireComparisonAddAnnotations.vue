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
                <Splitter
                    layout="vertical"
                    @resizeend="resize"
                >
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
                        <TabMenuEditor
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
                <Splitter
                    layout="vertical"
                    @resizeend="resize"
                >
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
                        <TabMenuEditor
                            :map-params="rightMapParams"
                            :template-i-d="rightTemplateID"
                            :preselected="rightPreselected"
                        />
                    </SplitterPanel>
                </Splitter>
            </SplitterPanel>
        </Splitter>
    </div>
    <AnnotationEditor
        v-if="showAnnotationEditor"
        :annotation-i-d="annotationID"
        :layer-options="layerOptions"
        :map-params="annotationMapParams"
        @close-annotation-editor="closeAnnotationEditor"
        @save-annotation-editor="saveAnnotationEditor"
    />
</template>

<script lang="ts" setup>
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import { computed, ref, provide, PropType, Ref, watch } from "vue"
import SingleFire from "../Components/editor/SingleFire.vue"
import TabMenuEditor from "../Components/editor/TabMenuEditor.vue"
import { MapParamsType } from '@/types/mapTypes'
import AnnotationEditor from "../Components/editor/ui/AnnotationEditor.vue"
import FireContentManager from '../Components/editor/map/maputils/project_specific/fire'
import { MapState } from '@/types/mapTypes'

import * as identifier from "../../store/localdb/identifiers.json"
import { CONTENT_MANAGER_KEY, MAP_RESIZE_KEY, MAP_MODE_KEY } from '@/injectionKeys'

import { useWildfireList } from "@/store/selectfire"
import { useEditor } from '@/store/editor'
import { useMap } from '@/store/map'

const fireListStore = useWildfireList()
const useEditorStore = useEditor()
const useMapStore = useMap() 

const leftTemplateID = identifier.mapIdentifier.ComparisonRight
const rightTemplateID = identifier.mapIdentifier.ComparisonLeft

const loadLeft = computed(() => fireListStore.validFire[leftTemplateID])
const loadRight = computed(() => fireListStore.validFire[rightTemplateID])
const updateSize = ref(true)
const resize = () => {
    updateSize.value = !updateSize.value
}
fireListStore.fetchFireList()

provide(CONTENT_MANAGER_KEY, FireContentManager)
provide(MAP_RESIZE_KEY, updateSize)
provide(MAP_MODE_KEY, "Editing")

const showAnnotationEditor = ref(false)
const annotationID = ref(0)
const annotationMapParams: Ref<MapParamsType> = ref()
const layerOptions: Ref<MapState.Layer<any>[]> = ref(null)

const closeAnnotationEditor = () => {
    useEditorStore.currentlyEditingAnnotation = false
    showAnnotationEditor.value = false
}
const saveAnnotationEditor = () => {
    useEditorStore.currentlyEditingAnnotation = false
    showAnnotationEditor.value = false
}
// If an annoation is marked to be edited, open the AnnotationEditor
watch(useEditorStore.editingAnnotation, (val) => {
    console.log("SDFSDFDFDFSD", val)
    if (val){
        console.log("in watch for editingAnnotation")
        if (useEditorStore.annotationToEdit.mapID == props.leftMapParams.mapID) {
            layerOptions.value = useMapStore.getLayerList(props.leftMapParams.mapID, props.leftMapParams.mapType)
            annotationID.value = useEditorStore.annotationToEdit.annotationID
            annotationMapParams.value = props.leftMapParams
        }
        if (useEditorStore.annotationToEdit.mapID == props.rightMapParams.mapID) {
            layerOptions.value = useMapStore.getLayerList(props.rightMapParams.mapID, props.rightMapParams.mapType)
            annotationID.value = useEditorStore.annotationToEdit.annotationID
            annotationMapParams.value = props.rightMapParams
        }
        showAnnotationEditor.value = true
    }
})

// Set default values
const props = defineProps({
    leftMapParams: {
        type: Object as PropType<MapParamsType>,
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
        default() {
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
