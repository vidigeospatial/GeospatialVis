<template>
    <div id="AnnotationEditorContainer">
        <div id="AnnotationEditorInnerContainer">
            <div class="col-1-3">
                <h2> Relevant Layers </h2>
                <div
                    v-for="layer of layerOptions"
                    id="AnnotationEditorCheckbox"
                    :key="layer.name"
                >
                    <Checkbox
                        v-model="selectedLayers"
                        :input-id="layer.name"
                        name="layer"
                        :value="layer"
                    />
                    <label :for="layer.name">{{ layer.name }}</label>
                </div>
            </div>
            <div class="col-2-3">
                <h2> Text </h2>
                <span class="p-float-label">
                    <Textarea
                        v-model="annotationText"
                        auto-resize
                    />
                    <label>Text for Annotation</label>
                </span>
            </div>
        </div>
        <Button
            label="Save"
            severity="secondary"
            @click="saveAnnotation"
        />
        <Button
            label="Close"
            severity="secondary"
            @click="$emit('close-annotation-editor')"
        />
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { MAP_EDITOR_KEY } from '@/injectionKeys'
import { useEditor } from '@/store/editor'
import { useMap } from '@/store/map'
import { MapState, MapParamsType } from '@/types/mapTypes'

const emit = defineEmits(['close-annotation-editor', 'save-annotation-editor'])

// const editorParams = inject(MAP_EDITOR_KEY)
const useEditorStore = useEditor()
const useMapStore = useMap()

// console.log("Currently editing slide ID", editorParams.currentlyEditingSlideID)

const props = defineProps<{
    annotationID: number
    layerOptions: MapState.Layer<any>[]
    mapParams: MapParamsType
}>()

if (props.annotationID == undefined){
    throw new Error("Annotation ID not defined in AnnotationEditor") 
}

console.log("Printing props.annotationID in annotationEditor", props.annotationID)

// const curSlideParams = useEditorStore.getSlideState(editorParams.currentlyEditingSlideID)
const curSlideParams = useEditorStore.getcurrentSlide()
let curAnnotationProps: MapState.annotationData = null

// Single map
if (curSlideParams['annotations']) {
    curAnnotationProps = curSlideParams['annotations'].find(a => a.id == props.annotationID)
} else {
    if (props.mapParams.mapID == curSlideParams['LeftMapParams'].mapID){
        curAnnotationProps = curSlideParams['annotations_left'].find(a => a.id == props.annotationID)
    }
    if (props.mapParams.mapID == curSlideParams['RightMapParams'].mapID){
        curAnnotationProps = curSlideParams['annotations_right'].find(a => a.id == props.annotationID)
    }
}

const selectedLayers = ref(curAnnotationProps.relevantLayers)
const annotationText  = ref(curAnnotationProps.text)

const saveAnnotation = () => {
    curAnnotationProps.text = annotationText.value
    curAnnotationProps.relevantLayers = selectedLayers.value
    emit('close-annotation-editor')
}

onMounted( () => {
    useMapStore.setAnnotationHighlighted(props.mapParams.mapID, props.mapParams.mapType, props.annotationID, true)
})

onUnmounted( () => {
    useMapStore.setAnnotationHighlighted(props.mapParams.mapID, props.mapParams.mapType, props.annotationID, false)
})

</script>

<style scoped>
#AnnotationEditorContainer {
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    font-size: 1rem;
    color: black;
    position: absolute;
    bottom: 5%;
    left: 5%;
    width: 40%;
    height: fit-content;
    margin: 24px;
    background: #fff;
    padding: 10px 24px;
    max-height: 96%;
    overflow-x: hidden;
    overflow-y: auto;
    overflow-y: overlay;
    outline: none;
    z-index: 1;
}

#AnnotationEditorInnerContainer {
    height: auto;
    display: flex;
}

#AnnotationEditorContainer p {
    text-align: center;
}

#AnnotationEditorInnerContainer .col-1-3 {
    flex: 1;
    display: flex;
    flex-direction: column;
}

#AnnotationEditorInnerContainer .col-2-3 {
    flex: 2
}

#AnnotationEditorTextTitle {
    font-size: 1rem;
}

.p-editor-contianer {
    height: 100%;
    font-size: 2rem;
}

Button {
    margin: 10px;
    float: right;
}

h1 {
    font-size: 1.5rem;
}

#AnnotationEditorCheckbox {
    display: flex;
    align-items: center;
}

.p-inputtextarea {
    width: 100%;
}

label {
    margin-left: 0.5rem;
}</style>