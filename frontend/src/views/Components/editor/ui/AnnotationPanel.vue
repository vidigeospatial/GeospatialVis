<template>
    <div class="AnnotationPanelContainer">
        <div>
            <h2> Annotation! </h2>
            <p id="AnnotationPanelBody" />
            <Divider />
            <h3> Relevant Layers </h3>
            <div id="AnnotationPanelRelevantLayerContainer">
                <LayerCard
                    v-for="option in props.annotationPanelProps.relevantLayers"
                    id="AnnotationPanelRelevantLayerCards"
                    :key="option.name"
                    :element="option"
                />
                <Button
                    :label="`${highlightLayerButtonText}`"
                    @click="highlightLayers"
                />
            </div>
            <Divider />
        </div>
        <Button
            label="Close"
            severity="secondary"
            @click="$emit('close-annotation-panel')"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, inject } from 'vue'
import { useMap } from '@/store/map'
import { MapState } from '@/types/mapTypes'
import { MAP_PARAMS_KEY } from '@/injectionKeys'

import Button from 'primevue/button'
import LayerCard from './LayerCard.vue'
import Divider from 'primevue/divider'

let oldLayerList: string[] = []
let highlightingLayers = false
const highlightLayerButtonText = ref('Show Relevant Layers Only') 
const mapStore = useMap()
const mapParams = inject(MAP_PARAMS_KEY)

onMounted(() => {
    document.getElementById("AnnotationPanelBody").innerHTML += props.annotationPanelProps.text
})

const emit = defineEmits(['close-annotation-panel', 'highlight-layers'])

const props = defineProps<{
    annotationPanelProps: MapState.annotationData
}>()

const highlightLayers = () => {
    highlightingLayers = !highlightingLayers
    console.log(mapParams)
    // Going from normal to highlighting relevant layers
    if (highlightingLayers) {
        highlightLayerButtonText.value = 'Revert back'
        oldLayerList = []
        mapStore.getLayerList(mapParams.mapID, mapParams.mapType).forEach(l => {
            if (l.visibility) {
                oldLayerList.push(l.name)
            }
        })
        emit('highlight-layers', props.annotationPanelProps.relevantLayers.map(l => l.name))
    } else {
        // Reverting back from highlighting to normal
        highlightLayerButtonText.value =  'Show Relevant Layers Only'
        emit('highlight-layers', oldLayerList)
    }
}
</script>

<style scoped>
.AnnotationPanelContainer{
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    font-size: 18px;
    position: absolute;
    top: 0;
    left: 0;
    width: 400px;
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
.AnnotationPanelContainer p {
    text-align: center;
}

#AnnotationPanelRelevantLayerContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#AnnotationPanelRelevantLayerCards {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
button {
    margin: 10px;
    float: right;
}

</style>
