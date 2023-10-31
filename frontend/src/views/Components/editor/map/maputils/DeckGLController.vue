<script setup lang="ts">
import { Ref, onMounted, watch, useAttrs, ref, nextTick, inject } from 'vue'
import { Deck } from '@deck.gl/core'
import Slider from '@vueform/slider'
import ContextMenu from 'primevue/contextmenu'
import Button from 'primevue/button'

import { useMap } from '@/store/map'
// import { useEditor } from '@/store/editor'
import { DECKGL_SETTINGS } from './settings/defaultSettings'
import { vueAnnotationProps } from "./layers/Annotations"
import InfoPanel from '../../ui/InfoPanel.vue'
// import SMInfoPanel from '../../ui/SMInfoPanel.vue'
import AnnotationPanel from '../../ui/AnnotationPanel.vue'
import { MAP_MODE_KEY, MAP_TIME_KEY, MAP_VIEWSTATE_KEY, MAP_PARAMS_KEY, MAP_RESIZE_KEY, MAP_EDITOR_KEY, CONTENT_MANAGER_KEY } from "@/injectionKeys"
import { MapState } from '@/types/mapTypes'

import { LayersList, MapViewState, Layer, OrbitController } from '@deck.gl/core/typed'
import { IContentManager, IContentManagerConstructor, createContentManager }from './project_specific/project_specific.interface'
import { Coords, LayerProp, InfoPanelProps } from '@/types/mapTypes'

import * as d3 from "d3"

import '@vueform/slider/themes/default.css'

const useMapStore = useMap()
// const useEditorStore = useEditor()

const attrs = useAttrs()
let deck: any = null
const emit = defineEmits(['click'])

const mapParams = inject(MAP_PARAMS_KEY)
const mapSizeUpdate = inject(MAP_RESIZE_KEY)
const mapMode = inject(MAP_MODE_KEY)


// Only define editorParams if the mapMode is Editing
// const editorParams: {scriptID: number, slideID: number} = mapMode == 'Editing' ? { scriptID: useEditorStore.scriptID, slideID: useEditorStore.slideID } : null
const editorParams = null

console.log("PRINTING injects in DeckGLSingleFire mapParams, mapSizeUpdate, mapMode", mapParams, mapSizeUpdate, mapMode)

// Is the animation running
let running: boolean = false

let annotationsProps: { [key: string]: LayerProp } = {}

let layerDescription: MapState.Layer<any>[]
let layerList: LayersList = null

//let currentTime = ref(0.0);
const currentAnimationTime = ref(0)

// Hold the settings for the layers
let settings: Record<string, string | boolean | number> = {}

const timeScaleLoaded = ref(false)

let timeScale: d3.ScaleTime<number, Date> = null
// Need to map annotations back to 0-1 range
let inverseTimeScale: d3.ScaleTime<Date, number> = null

const showAnnotations = ref(false)
// Feeds annotations data into the annotations panel
let curAnnotationsProps: Ref<MapState.annotationData> = ref(null)

let toggleAnimate = ref("pi-play")

let svg = null
let ContentManager: IContentManager = null
const ContentManagerLoaded = ref(false)

let annotationToAddID = 0
let annotationToAddCoordinate = null
const annotationDragged = ref(false)

// Is this a dynamic or static map
const SM = ref(false)
const SMInfoPanelText = ref("")

// Change target canvas
let canvasname = `deck-canvas-${mapParams.mapType}-${mapParams.mapID}`
let _DECKGL_SETTINGS = { ...DECKGL_SETTINGS, canvas: canvasname }

onMounted(() => { 

    SM.value = mapParams?.SM? true : false

    deck = new Deck({
        onViewStateChange: ({ viewState }) => handleViewChange(viewState),
        ..._DECKGL_SETTINGS,
        ...attrs,
        useDevicePixels: false,
        onClick: (info, event) => {
            // On click...
            // 1: If right click, add annotation (if the parent is listening)
            // 2: If left clicked on icon, open modal

            if (event.type == 'click' && event.rightButton) {
                annotationToAddCoordinate = info.coordinate
            }
            // Check if item is piccked and if it is an icon, then open
            // the modal for annotations
            if (info.picked && info.layer.id.includes("Icons")) {
                showAnnotations.value = false
                // Make sure the annotationWindow is actually gone
                nextTick(() => {
                    curAnnotationsProps.value = info.layer.props as MapState.annotationData
                    showAnnotations.value = true
                })
                nextTick(() => {
                    // Force color change icon via handlesettings
                    drawAllLayers()
                })
            }
            emit('click', { info, event })
        },
    })

    let temp: IContentManagerConstructor = inject(CONTENT_MANAGER_KEY)
    ContentManager = createContentManager(temp, mapParams, editorParams, useMapStore.getLayerList(mapParams.mapID, mapParams.mapType))

    ContentManagerLoaded.value = true;

    [ timeScale, inverseTimeScale ] = ContentManager.getTimeScales()
    timeScaleLoaded.value = true

    /**
     * Set up watchers for layerList, annotations, and mapResize
     */
    const watchedIndex = useMapStore.findActiveIDX(mapParams.mapID, mapParams.mapType)
    let mapState = useMapStore.deckGLMapState[watchedIndex]._data 

    // Watch for changes in the layerList - is an eager watcher
    watch(() => mapState.layerList, (newVal) => {
        layerDescription = newVal
        layerList = ContentManager.getAllLayerProps(
            newVal,
            currentAnimationTime.value,
            settings,
            mapMode,
            showAnnotations,
            annotationDragged,
            deck
        )
        console.log("LayerList Changed")
        drawAllLayers()
    }, { immediate: true, deep: true })

    // Watch for changes in the annotations list - is an eager watcher
    watch(() => mapState.annotations, (newVal) => {
        let annotationsPropsObject = new vueAnnotationProps(mapParams.mapID, inverseTimeScale)
        annotationsProps = annotationsPropsObject.getProps(newVal)
        console.log("Annotations Changed", annotationsProps)
        let filteredAnimatedProps = Object.keys(ContentManager.animatedProps).reduce(function (filtered, key) {
            if (!ContentManager.animatedProps[key].id.startsWith('Icon')) filtered[key] = ContentManager.animatedProps[key]
            return filtered
        }, {})
        ContentManager.animatedProps = {
            ...filteredAnimatedProps,
            ...annotationsProps
        }
        annotationToAddID = Object.keys(annotationsProps).length
        drawAllLayers()
    }, { immediate: true, deep: true })

    // Watch for animation time change - is an eager watcher
    watch(currentAnimationTime, (newVal) => {
        // If there's already an assigned time, don't change it
        // if (mapState.currentTime == undefined)
        mapState.currentTime = timeScale(newVal).getTime()
    })

    // Watch for changes in the mapSize - is an eager watcher
    nextTick(() => {
        watch(mapSizeUpdate, () => {
            buildTimeScale()
        }, { immediate: true })
    })

    watch(() => mapState.currentTime, (newVal) => {
        if (newVal != undefined) {
            currentAnimationTime.value = inverseTimeScale(newVal)
            SMInfoPanelText.value = `${ContentManager.formatTimeString(new Date(newVal))}`
            drawAllLayers()
        }
    }, { immediate: true })

    watch(useMapStore.deckGLMapState[watchedIndex]._viewState, (newVal) => {
        handleViewChange(newVal)
    })
    
    // Setup settings object that handles the layer settings at each iteration
    // setupSettings();
    // Setup the deckgl tooltip and the info. that it requires
    // setupTooltip();

    // Make sure the timeslider exists and then build the timescale
    
    // Need to disable default context menu for right click
    if (mapMode == 'Editing') { deck.canvas.addEventListener('contextmenu', evt => evt.preventDefault()) }

    handleViewChange(ContentManager.getInitialViewState())
})

function buildTimeScale() {
    // Assume that the data is chronologically ordered

    let container = document.getElementById(`timeSlider-${mapParams.mapType}-${mapParams.mapID}`)
    let container2 = document.getElementById('button-slider')

    let containerWidth = container?.clientWidth
    let containerHeight = container2?.clientHeight

    // If a timescale was previously there remove it
    if (svg) {
        d3.select(`#timeSliderSVG-${mapParams.mapType}-${mapParams.mapID}`).remove()
    }

    svg = d3.select(`#timeSlider-${mapParams.mapType}-${mapParams.mapID}`)
        .append("svg")
        .attr("id", `timeSliderSVG-${mapParams.mapType}-${mapParams.mapID}`)
        .attr("viewBox", [0, 0, containerWidth, containerHeight])
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .attr("class", "axis")
        .attr("transform", `translate(0, ${containerHeight / 10})`)
    //.style("margin", "auto")
    
    let [scale, interval, format] = ContentManager.getTimeSliderScaleParams()

    svg.append("g").call(
        d3.axisBottom(scale.range([0, containerWidth])).
            ticks(interval, format))
    d3.selectAll(".axis line")
        .style("stroke", "black")
    d3.selectAll(".axis text")
        .style("stroke", "black")
        .style("fill", "black")
        .style("font-size", "1.5rem")
    d3.selectAll(".axis path")
        .style("stroke", "black")

}

function drawAllLayers() {
    layerList = ContentManager.getAllLayerProps(
        layerDescription,
        currentAnimationTime.value,
        settings,
        mapMode,
        showAnnotations,
        annotationDragged,
        deck
    )
    layerList = ContentManager.handleSettings(
        settings,
        layerList,
        showAnnotations,
        curAnnotationsProps
    )
    console.log(layerList)
    deck.setProps({ layers: [...layerList] })
}

// function addAnnotation(coordinate: Coords){
//     console.log("DeckGL rightClickOnMap at ", coordinate)
//     const padWithZeros = num => num.toString().padStart(2, '0')
//     const formatTime = date => `${date.toLocaleString('default', { month: 'short' })} ${padWithZeros(date.getDate())} ${date.getFullYear()} ${padWithZeros(date.getHours())}:${padWithZeros(date.getMinutes())}:${padWithZeros(date.getSeconds())}`

//     let newSlideState = useEditorStore.getcurrentSlide()
//     let newAnnotation = {
//         "id": annotationToAddID,
//         "location": annotationToAddCoordinate,
//         "timestamp": formatTime(timeScale(currentAnimationTime.value)),
//         "text": "Edit Annotation Text",
//         "relevantLayers": [],
//         "highlighted": false
//     }

//     // Single map
//     if (newSlideState['annotations']) {
//         newSlideState['annotations'] = newSlideState['annotations'].concat(newAnnotation)
//     } else {
//         if (mapParams.mapID == newSlideState['LeftMapParams'].mapID){
//             newSlideState['annotations_left'] = newSlideState['annotations_left'].concat(newAnnotation)
//         }
//         if (mapParams.mapID == newSlideState['RightMapParams'].mapID){
//             newSlideState['annotations_right'] = newSlideState['annotations_right'].concat(newAnnotation)
//         }
//     }

//     // useEditorStore.setSlideState(editorParams.currentlyEditingSlideID, newSlideState)
//     // useEditorStore.updateSlide(newSlideState, useEditorStore.scriptID, useEditorStore.slideID )

//     // Update editor store to mark an annotation is selected for editing
//     // useEditorStore.editAnnotation(useEditorStore.scriptID, useEditorStore.slideID, mapParams.mapID, annotationToAddID)
//     annotationToAddID += 1
// }

// Parent function to run the animation
function animate() {
    if (!running) { return }
    // Increment the currentTime
    currentAnimationTime.value = (currentAnimationTime.value + 0.0006) % 1.0
    drawAllLayers()
    requestAnimationFrame(animate)
}

function handleViewChange(viewState) {
    deck.setProps({ viewState: { ...viewState } })
    useMapStore.changeViewState(viewState, mapParams.mapID, mapParams.mapType)
}

// Toggling functions to attach to the buttons
function toggleAnimation() {
    toggleAnimate.value = (running) ? "pi-play" : "pi-pause"
    running = !running
    animate()
}

const closeAnnotation = () => {
    showAnnotations.value = false
}

const highlightLayer = (layerNames: string[]) => {
    const watchedIndex = useMapStore.deckGLMapState.findIndex(map => map._metaData.id == mapParams.mapID && map._metaData.active)
    let singleFireMapState = useMapStore.deckGLMapState[watchedIndex]._data 
    singleFireMapState.layerList = singleFireMapState.layerList.map(l => layerNames.includes(l.name) ? { ...l, visibility: true } : { ...l, visibility: false })
}

function settingsChanged(updatedSettings) {
    settings = { ...settings, ...updatedSettings }
    drawAllLayers()
    console.log('setting changed', updatedSettings)
}

// Attaches to the slider to format the tooltip on the slider - returns a string
function formatToolTip(value) {
    return ContentManager.formatTimeString(timeScale(value))
}

function sliderUpdate() {
    drawAllLayers()
}

const menu = ref()
const items = ref([
    {
        label: 'Add annotation',
        icon: 'pi pi-fw pi-plus',
        command: () => { addAnnotation(annotationToAddCoordinate) }
    }
])
const onRightClick = (event) => {
    if (mapMode == 'Editing')
        menu.value.show(event)
}

</script>

<template>
    <div class="deck-container">
        <AnnotationPanel
            v-if="showAnnotations"
            :annotation-panel-props="curAnnotationsProps"
            @close-annotation-panel="closeAnnotation"
            @highlight-layers="highlightLayer"
        />
        <InfoPanel
            v-if="!SM && ContentManagerLoaded"
            :settings="ContentManager.getInfoPanelSettings()"
            @settings-changed="settingsChanged"
        />
        <!-- <SMInfoPanel
            v-if="SM"
            :text="SMInfoPanelText"
        /> -->
            
        <slot />
        <div>
            <canvas
                :id="`deck-canvas-${mapParams.mapType}-${mapParams.mapID}`"
                class="deck-canvas-single-fire"
                @contextmenu="onRightClick"
            />
            <ContextMenu
                v-if="mapMode == 'Editing' "
                ref="menu"
                :model="items"
            />
        </div>
        <div
            v-show="!SM"
            id="button-slider"
            class="button-slider"
        >
            <Button
                :icon="`pi ${toggleAnimate}`"
                class="rounded-full "
                @click="toggleAnimation()"
            />
            <Slider
                v-if="timeScaleLoaded"
                :id="`timeSlider-${mapParams.mapType}-${mapParams.mapID}`"
                v-model="currentAnimationTime"
                class="slider"
                :min="0"
                :max="1"
                :step="-1"
                :format="formatToolTip"
                @change="sliderUpdate"
            />
        </div>
    </div>
</template>

<style scoped>
.deck-canvas-single-fire {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 95%;
}

.deck-container {
    flex-grow: 1;
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
}

.button-slider {
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    height: 8%;
    top: 85%;
    left: auto;
    width: 80%;
    z-index: 1;
    position: absolute;
    background-color: rgba(255, 255, 255, 1);
    border-radius: 4vh 4vh 4vh 4vh;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin: auto;
}

.slider {
    width: 90%;
    display: inline-block;
    --slider-tooltip-font-size: 1.5rem;
    --slider-tooltip-line-height: 1.75rem;
}

.deck-tooltip {
    width: 50%;
    height: 50%;
    font-family: Helvetica, Arial, sans-serif;
    padding: 6px !important;
    margin: 8px;
    max-width: 300px;
    font-size: 10px;
}

.deck-container ol {
    text-align: left;
}

button {
    color: white;
    font-size: 0.7rem;
}

.buttonArray {
    position: relative;
    height: 50%;
}</style>
