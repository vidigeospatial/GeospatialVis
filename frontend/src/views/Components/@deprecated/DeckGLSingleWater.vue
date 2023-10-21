<script setup lang="ts">
import { onMounted, watch, useAttrs, toRaw, ref, nextTick, inject } from 'vue'
import { Deck } from '@deck.gl/core'
import Slider from '@vueform/slider'
import Button from 'primevue/button'

import { useMap } from '@/store/map'
// import { useData } from '@/store/data'
import { DECKGL_SETTINGS } from './settings/defaultSettings'

import { vueAnimatedProps } from "./layers/AnimatedProps_Water"
import { vueAnnotationProps  } from "./layers/Annotations"
import { AnimatedPathLayer } from './layers/AnimatedPath'
import { AnimatedGridCellLayer } from './layers/AnimatedGridCell2'
import { AnimatedHeatmapLayer } from './layers/AnimatedHeatmap'
import ParticleLayer from './layers/ParticleAdvection/particle-layer'
import InfoPanel from '../../ui/InfoPanel.vue'
import AnnotationPanel from '../../ui/AnnotationPanel.vue'
import InfoPanelSettings from '@/store/localdb/InfoPanelSettingsWater.json'
import DeckGLToolTip from '../../ui/DeckGLToolTip.vue'
import { MAP_MODE_KEY, MAP_PARAMS_KEY, MAP_RESIZE_KEY, MAP_EDITOR_KEY } from "@/injectionKeys"

import baselineUnmet from '@/assets/data/baseline_unmetdemand.json'
import comparisonUnmet from '@/assets/data/comparison_unmetdemand.json'
import differenceUnmet from '@/assets/data/difference_unmetdemand.json'

// import geometry_Nodes from '@/assets/data/geometry_Nodes.json'
// import geometry_Reservoir from '@/assets/data/geometry_Reservoir.json'

import type { Coords, LayerProp } from '@/types/mapTypes'
import type { LayersList, MapViewState  } from '@deck.gl/core/typed'

import { MapState } from '@/types/mapTypes'
import { GridCellLayer, TextLayer, IconLayer, GeoJsonLayer } from '@deck.gl/layers/typed'

import * as d3 from "d3"

import '@vueform/slider/themes/default.css'
import { ClusterNode } from '@flowmap.gl/data'

const useMapStore = useMap()
const mapSizeUpdate = inject(MAP_RESIZE_KEY)

watch(mapSizeUpdate, () => { buildTimeScale() })
// const useDataStore = useData()
const attrs = useAttrs()

let deck: any = null
const emit = defineEmits(['click'])

// fireID is just a name now, but should be the UID in the future
const props = defineProps<{
    mapID: string,
    fireID: string,
    mapType: string
}>()

let annotationsProps: { [key: string]: LayerProp } = {}
let animatedLayerProps: { [key: string]: LayerProp } = {}
let animatedLayerDescription: string[] = []
let layerList: LayersList = null

// Hold the settings for the layers
let settings: Record<string, string | boolean | number> = {}

let currentTime = ref(0)

let loaded = ref(false)
let running = ref(false)

let timeScale: any = null
// Need to map annotations back to 0-1 range
let inverseTimeScale: any

let showAnnotations = ref(false)
let curAnnotationsProps = ref({})

let toggleAnimate = ref("pi-play")

let svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> = null

let showTooltip = ref(false)
let toolTipText = ref("")

const mapResize = inject(MAP_RESIZE_KEY)

// Change target canvas
let canvasname = `deck-canvas-single-water-${props.mapID}`
let _DECKGL_SETTINGS = { ...DECKGL_SETTINGS, canvas: canvasname }

const mapParams = inject(MAP_PARAMS_KEY)
const layerListDesc = useMapStore.getLayerList(mapParams.mapID, mapParams.mapType)

let featureCollectionBaseline = {
    "type": 'FeatureCollection',
    "features": []
}
let featureCollectionComparison = {
    "type": 'FeatureCollection',
    "features": []
}
let featureCollectionDifference = {
    "type": 'FeatureCollection',
    "features": []
}

const start = '10/31/1921'
const end = '9/30/2021'

onMounted(() => {
    baselineUnmet.forEach(
        (d: any) => {
            let parsed = JSON.parse(d[1200])

            featureCollectionBaseline.features.push({
                type: 'Feature',
                properties: {
                    unmetDemand: Object.values(d).slice(0, 1200),
                },
                geometry: {
                    type: parsed.type,
                    coordinates: parsed.coordinates
                }
            })

        }
    )

    comparisonUnmet.forEach(
        (d: any) => {
            let parsed = JSON.parse(d[1200])

            featureCollectionComparison.features.push({
                type: 'Feature',
                properties: {
                    unmetDemand: Object.values(d).slice(0, 1200),
                },
                geometry: {
                    type: parsed.type,
                    coordinates: parsed.coordinates
                }
            })
        }
    )

    differenceUnmet.forEach(
        (d: any) => {
            let parsed = JSON.parse(d[1200])

            featureCollectionDifference.features.push({
                type: 'feature',
                properties: {
                    difference: Object.values(d).slice(0, 1200),
                },
                geometry: {
                    type: parsed.type,
                    coordinates: parsed.coordinates
                }
            })

        }
    )
    let temp = generateDeckGLLayers(layerListDesc)
    // let temp = generateDeckGLLayers(layerListDesc);
    layerList = temp[0]
    animatedLayerDescription = temp[1]

    // layerList = reactive([...layerList]);

    deck = new Deck({
        onViewStateChange: ({ viewState }) => handleViewChange(viewState),
        ..._DECKGL_SETTINGS,
        ...attrs,
        onClick: (info: any, event: any): void => {
            // Check if item is piccked and if it is an icon, then open
            // the modal for annotations
            // if (info.picked && info.layer.id.includes("Icons")){
            //     getModal(info.layer)
            // }
            if (info.picked && info.layer.id.includes("Icons")) {
                showAnnotations.value = false
                // Make sure the annotationWindow is actually gone
                nextTick(() => {
                    curAnnotationsProps.value = info.layer.props as MapState.annotationData
                    showAnnotations.value = true
                })
            }
            emit('click', { info, event })
        },
        onHover: (info) => {
            showTooltip.value = false
        }
    })

    const watchedIndex = useMapStore.deckGLMapState.findIndex(map => map._metaData.id == mapParams.mapID && map._metaData.active)
    watch(useMapStore.deckGLMapState[watchedIndex]._data.layerList, (newVal) => {
        const updateLayerListDesc = useMapStore.getLayerList(mapParams.mapID, mapParams.mapType)

        let layersInfo = generateDeckGLLayers(updateLayerListDesc)
        //layerList = generateDeckGLLayers(updateLayerListDesc)
        layerList = layersInfo[0]
        animatedLayerDescription = layersInfo[1]
        deck.setProps({ layers: [...layerList] })
        console.log("Layer List Changed", layerList)
        drawAllLayers()
    })

    handleViewChange({
        longitude: -122,
        latitude: 39,
        zoom: 9,
        pitch: 120,
        bearing: 30
    })

    // Setup settings object that handles the layer settings at each iteration
    // setupSettings();
    // Setup the deckgl tooltip and the info. that it requires
    // setupTooltip();
    animatedLayerProps = getAnimatedProps()
    drawAllLayers()
})

function getModal(object){
    showAnnotations.value = false
    // Make sure the annotationWindow is actually gone
    nextTick(() => {
        curAnnotationsProps.value['id'] = object.props.id
        curAnnotationsProps.value['text'] = object.props.text
        showAnnotations.value = true
        drawAllLayers()
    })
}

function buildTimeScale(){
    // Assume that the data is chronologically ordered

    let container = document.getElementById(`timeSlider-${props.mapID}`)
    let container2 = document.getElementById('button-slider')

    let containerWidth = container?.clientWidth
    let containerHeight = container2?.clientHeight

    // // If a timescale was previously there remove it
    if (svg) {
        d3.select(`#timeSliderSVG-${props.mapID}`).remove()
    }

    svg = d3.select(`#timeSlider-${props.mapID}`)
        .append("svg")
        .attr("id",`timeSliderSVG-${props.mapID}`)
        .attr("viewBox", [0, 0, containerWidth, containerHeight])
        .attr("width", containerWidth )
        .attr("height", containerHeight )
        .attr("class", "axis")
        .attr("transform", `translate(0, ${containerHeight / 10})`)
        //.style("margin", "auto")

    let scale = d3.scaleTime()
        .domain([new Date(start), new Date(end)])

    svg.append("g").call(  
        d3.axisBottom(scale.range([0, containerWidth])).
            ticks(d3.timeYear.every(5), "%Y"))
    d3.selectAll(".axis line")
        .style("stroke","black")
    d3.selectAll(".axis text")
        .style("stroke","black")
        .style("fill","black")
        .style("font-size","1rem")
    d3.selectAll(".axis path")
        .style("stroke","black")

}
// Grab the animated layer properties and build the time scale svg
function getAnimatedProps(): { [key: string]: LayerProp }{

    let animatedPropsObject = new vueAnimatedProps()
    let animatedProps = animatedPropsObject.getAnimatedProps()

    // If a timescale was previously there remove it
    if (svg){
        d3.select('#timeSliderSVG').remove()
    }

    timeScale = d3.scaleTime<Date, number>()
        .range([new Date(start), new Date(end)])
        .domain([0, 1])
    inverseTimeScale = d3.scaleTime<number, Date>()
        .domain([new Date(start), new Date(end)])
        .range([0, 1])

    // Annotation props are made after the time scale so that the
    // inverse time scale exists to map annotations
    let annotationsPropsObject = new vueAnnotationProps(props.mapID, inverseTimeScale)
    annotationsProps = annotationsPropsObject.getProps([{
        "location": [
            -120.103,
            36.42
        ],
        "text": "This area experiences high unmet water demand under historical baselines around Jul 1929",
        "timestamp": "Jul 1929",
        "relevantLayers": [
            {
                "name": "Baseline",
                "icon": "water-tap",
                "description": "Baseline deliveries"
            }
        ],
        "highlighted": false
    }])

    animatedProps = {
        ...animatedProps,
        ...annotationsProps
    }

    // Data is loaded and slider can be built
    loaded.value = true
    nextTick(() => {
        buildTimeScale()
    })

    return animatedProps
}

// Create Layers based on Types
function generateDeckGLLayers(layerDescription: MapState.Layer<any>[]): [LayersList, string[]]{
    let layerList = []
    let animatedLayerDescription = []

    layerDescription.forEach(element => {
        // If the layer has an animated component, then add it to the animatedLayerDescription
        if (element.animated) {
            if (element.visibility)
                animatedLayerDescription.push(element.name)
        }
    })
   
    // let shapes: { [key: string]: Coords[] } = {}
    // let textLayerProps = []
    // let gridCellLayerProps = []
    // let iconLayerProps = []
    // let flowmapProps = {
    //     locations: [],
    //     flows: []
    // }

    // // Set of calsimid that are in the data
    // let CalSim_Arc_IDs = Object.entries(data[0]).filter(([key, value]) => key.startsWith('C_')).map(d => d[0])
    // let CalSim_Node_IDs: string[] = []

    // // Get all the start and end nodes for the arcs
    // CalSim_Arc_IDs.forEach((d: string) => {
    //     let entry = geometry.find(e => e.Arc_ID == d)
    //     if (entry){
    //         if (!CalSim_Node_IDs.includes(entry.From_Node)){
    //             CalSim_Node_IDs.push(entry.From_Node)
    //         }
    //         if (!CalSim_Node_IDs.includes(entry.To_Node)){
    //             CalSim_Node_IDs.push(entry.To_Node)
    //         }
    //     }
    // })

    // CalSim_Node_IDs.forEach(d => {
    //     let entry: any = geometry_Nodes.find(e => e.CalSim_ID == d);
    //     if (entry) {
    //         iconLayerProps.push({
    //             ...entry,
    //             geometry: entry.geometry.match(/\((.*?)\)/)[1].split(' ').map(d => parseFloat(d))
    //         })
    //         flowmapProps.locations.push({
    //             id: entry.CalSim_ID,
    //             lon: entry.geometry.match(/\((.*?)\)/)[1].split(' ').map(d => parseFloat(d))[0],
    //             lat: entry.geometry.match(/\((.*?)\)/)[1].split(' ').map(d => parseFloat(d))[1]
    //         })
    //     }
    // })

    // let cfs_values = []

    // for (const obj in data[0]){
    //     if (obj.startsWith('C_')){
    //         let entry = geometry.find(e => e.Arc_ID == obj)
    //         if (entry) {
    //             cfs_values.push(parseFloat(data[0][obj]))
    //             flowmapProps.flows.push({
    //                 origin: entry.From_Node,
    //                 dest: entry.To_Node,
    //                 flow: parseFloat(data[0][obj])
    //             })

    //         }
    //     }
    // }
    
    // let flowMap_getColor = (flow: number) => 
    //     d3.interpolateBlues(
    //             d3.scaleLinear().domain(d3.extent(cfs_values)).range([0, 1])(flow)
    //           ).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
    
    // const regex=/\(\((.*?)\)\)/

    // geometry.forEach(
    //     (d: any) => {
    //         let shape: Coords[] = d.geometry.match(regex)[1].split(',').map((d: string) => d.trim().split(' ').map((d: string) => parseFloat(d)))
    //         shapes[d.Arc_ID] = shape

    //         featureCollection.features.push({ 
    //             type: 'Feature',
    //             geometry: {
    //                 // type: 'Polygon',
    //                 type: 'MultiLineString',
    //                 properties: {
    //                     Arc_ID: d.Arc_ID,
    //                     CalSim_ID: d.CalSim_ID,
    //                     From_Node: d.From_Node,
    //                     HR: d.HR,
    //                     NAME: d.NAME,
    //                     OBJECTID: d.OBJECTID,
    //                     Shape_Leng: d.Shape_Leng,
    //                     Sub_Type: d.Sub_Type,
    //                     To_Node: d.To_Node
    //                 },
    //                 coordinates: [shape] 
    //             }
    //         })
    //         textLayerProps.push({
    //             name: `${d.NAME}-${d.Arc_ID}`,
    //             coordinates: d.geometry.match(regex)[1].split(',').map((d: string) => d.trim().split(' ').map((d: string) => parseFloat(d)))[0]
    //         })
    //     }
    // )

    // function makeArr(startValue, stopValue, cardinality) {
    //     var arr = [];
    //     var step = (stopValue - startValue) / (cardinality - 1);
    //     for (var i = 0; i < cardinality; i++) {
    //         arr.push(startValue + (step * i));
    //     }
    //     return arr;
    // }

    // // Map ArcID to a cubic spline
    // let splines: Record<string, Spline> = {}
    // let timeScale = d3.scaleTime()
    //     .domain([new Date(data[0]['A']), new Date(data[data.length-1]['A'])])
    //     .range([0, 1])
    
    // console.log(CalSim_Arc_IDs)
    // let cfs_extent = d3.extent(Object.entries(data[0]).filter(([key, value]) => key.startsWith('C_')).map(d=>parseFloat(d[1])))
    // for (const id of CalSim_Arc_IDs){
    //     // IDK what to do with the SAC_029A thing
    //     if (!id.endsWith("A")){
    //         // splines[id] = new Spline(makeArr(0, 1, data.length), data.map(d => parseFloat(d[id])))
    //         console.log(id)
    //         console.log(shapes[id][0])
    //         gridCellLayerProps.push({
    //             coordinates: shapes[id][0],
    //             time: timeScale(new Date(data[0]['A'])),
    //             value: parseFloat(data[0][id]),
    //             color: d3.interpolateBlues(
    //                     d3.scaleLinear().domain(cfs_extent).range([0, 1])(parseFloat(data[0][id]))).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
    //         })

    //     }
    // }

    // // for (const obj in data[0]){
    // //     console.log(obj)
    // //     // If its a channell
    // //     if (obj in shapes && obj.startsWith('C_')){
    // //         gridCellLayerProps.push({
    // //             name: obj,
    // //             coordinates: shapes[obj][0],
    // //             value: parseFloat(data[0][obj]),
    // //             // color: d3.interpolateBlues().domain(cfs_extent).range(["white", "blue"])(parseFloat(data[0][obj])).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
    // //             color: d3.interpolateBlues(
    // //                 d3.scaleLinear().domain(cfs_extent).range([0,1])(parseFloat(data[0][obj]))
    // //             ).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
    // //         })
    // //     }
    // // }

    // const ICON_MAPPING = {
    //     marker: { x: 128, y: 0, width: 128, height: 128, anchorY: 127 }
    // }
    // // const flowLayer = new FlowMapLayer({
    // //     id: 'my-flowmap-layer',
    // //     data: flowmapProps,
    // //     pickable: true,
    // //     getLocationId: (loc) => loc.id,
    // //     getLocationLat: (loc) => loc.lat,
    // //     getLocationLon: (loc) => loc.lon,
    // //     getFlowOriginId: (flow) => flow.origin,
    // //     getFlowDestId: (flow) => flow.dest,
    // //     getFlowMagnitude: (flow) => flow.flow,
    // //     getLocationName: (loc) => loc.id,
    // //     getLocationCentroid: (location) => [location.lon, location.lat],
    // //     getColor: (flow) => [255, 0, 0, 255],
    // //     // getColor: (flow) => flowMap_getColor(flow.flow),
    // //     highlightColor: '#ff9b29',
    // //     opacity: 1,
    // //     animationEnabled: false,
    // //     clusteringEnabled: false,
    // //     fadeEnabled: false,
    // //     adaptiveScalesEnabled: false,
    // //     onHover: (info: FlowPickingInfo<ClusterNode, ClusterNode>) => {
    // //         if (info) {
    // //             console.log(info)
    // //             toolTipText.value = `From: ${info.origin.id}, To: ${info.dest.id} - Count: ${info.object.count} (CFS)`
    // //             showTooltip.value = true
    // //         }
    // //     },
    // //     // onClick: (info) => console.log('clicked', info.type, info.object),
    // // })

    // const iconLayer = new IconLayer({
    //     id: 'Icons',
    //     data: iconLayerProps,
    //     iconAtlas: 'https://raw.githubusercontent.com/yuya737/assets/main/icon-atlas.png',
    //     // iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
    //     iconMapping: ICON_MAPPING,
    //     getPosition: d => d.geometry,
    //     getSize: 15,
    //     getIcon: d => 'marker',
    //     sizeScale: 2,
    //     pickable: true
    // })

    // const textLayer2 = new TextLayer({
    //     id: 'text2',
    //     data: iconLayerProps,
    //     getPosition: d => d.geometry,
    //     getText: d => d.CalSim_ID,
    //     getSize: 7,
    //     sizeScale: 2,
    //     getTextAnchor: 'end',
    //     getAlignmentBaseline: 'top',
    //     pickable: true
    // })

    // const layer = new GeoJsonLayer({
    //     id: 'Water',
    //     data: featureCollection,
    //     opacity: 0.75,
    //     getFillColor : [0, 0, 255, 255],
    //     getLineColor : [0, 0, 255, 255],
    //     getLineWidth: 100,
    //     lineWidthScale: 5,
    //     onHover: (info) => {
    //         console.log(info)
    //     },
    // })
    
    // const textLayer = new TextLayer({
    //     id: 'text-layer',
    //     data: textLayerProps,
    //     getPosition: d => d.coordinates,
    //     getText: d => d.name,
    //     getSize: 7,
    //     sizeScale: 2,
    //     getAngle: 0,
    //     getTextAnchor: 'start',
    //     getAlignmentBaseline: 'bottom'
    // });
    // const gridCellLayer = new GridCellLayer({
    //     id: 'grid-cell-layer',
    //     data: gridCellLayerProps,
    //     extruded: true,
    //     pickable: true,
    //     getPosition: d => d.coordinates,
    //     getElevation: d => d.value,
    //     getColor: d => d.color
    // })
    // // console.log(gridCellLayerProps)

    // layerList.push(layer)
    // layerList.push(textLayer)
    // layerList.push(textLayer2)
    // // layerList.push(iconLayer)
    // // layerList.push(flowLayer)
    // layerList.push(gridCellLayer)

    // animatedLayerDescription.push("Flow")
    // console.log(layerList)
    return [layerList, animatedLayerDescription]
}
/*

// Setup the settings object and the props for the InfoPanel
function setupSettings(){
    InfoPanelSettings.forEach(element => {
        if (element.options){
            element.options.forEach(option => {
                    settings[option.emitVal] = option.default
            })
        }
    })
}

function setupTooltip(){
    let frpData = useDataStore.getData(props.fireID, 'frp');
    let powerData = frpData.map(d => parseFloat(d.power));
    let confidenceData = frpData.map(d => d.processed_confidence);
    deckTooltipData = {
        'power': powerData,
        'confidence': confidenceData
    }
}

*/

function handleSettings(layers){
    // Show arrows for wind?
    // if (settings['Wind_Arrows'] == false)
    //     layers = layers.map(d => d.id == 'Wind_Arrows' ? d.clone({visible: false}) : d)

    // // Show particle advection for wind?
    // if (settings['Wind_Particle'] == false)
    //     layers = layers.map(d => d.id == 'Wind_Particle' ? d.clone({visible: false}) : d)

    // // Smooth the perimeters?
    // if (settings['Perimeter_Smooth'] == true)
    //     layers = layers.map(d => d.id == 'Perimeter' ? d.clone({getPath: data => data.smoothed_path}) : d);

    // if (settings['Wind_Particle_Colors'] == 'No Color')
    //     layers = layers.map(d => d.id == 'Wind_Particle' ? d.clone({colorSetting: 0.}) : d)
    // if (settings['Wind_Particle_Colors'] == 'Temperature')
    //     layers = layers.map(d => d.id == 'Wind_Particle' ? d.clone({colorSetting: 1.}) : d)
    // if (settings['Wind_Particle_Colors'] == 'Humidity')
    //     layers = layers.map(d => d.id == 'Wind_Particle' ? d.clone({colorSetting: 2.}) : d)

    // // If annoatations are showing, change the icon atlas (i.e. the image)
    // if (showAnnotations.value == true)
    //     layers = layers.map(d => d.id == curAnnotationsProps.value.id ? d.clone({iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png'}) : d)

    return layers
}

function drawAllLayers(){
    let allProps = handleSettings(getAllLayerProps())
    deck.setProps({ layers: [...allProps] })
}

function getAllLayerProps(){
    // console.log('getAllLayerProps: ' + animatedLayerDescription)

    // Filter based on animatedLayerDescription
    let filteredAnimatedLayerProps = Object.entries(animatedLayerProps).filter(
        ([k,v]) =>  

        // This is a hack right now
        // Multiple DECKGL layers can correspond to one layer (from the user perspective)
        // e.g. Satellite_0 and Satellite_1 both deal with the Satellite layer
        // so split with '_' and grab the first element
            k.startsWith('Animated') ? animatedLayerDescription.includes(v.id.split('_')[0]) : true
    )
    let curAnimatedLayerProps = Object.fromEntries(filteredAnimatedLayerProps)

    // Build the animated layer list
    let animatedLayerList = Object.entries(curAnimatedLayerProps).map(([k,v])=> { 
        if (k == 'AnimatedPath') { 
            return new AnimatedPathLayer( { ...v, 
                animationProgress: currentTime.value,
                getPath: data => data.path,
                updateTriggers: {
                    getPath: settings['Perimeter_Smooth']
                }
            } ) 
        } else if (k == 'AnimatedGridCell') {
            return new AnimatedGridCellLayer({ ...v, 
                animationProgress: currentTime.value,
            })
        } else if (k == 'AnimatedHeatmap') {
            return new AnimatedHeatmapLayer(v)
        } else if (k == 'AnimatedTextIcons') {
            return new TextLayer(v)
        } else if (k.startsWith('Icons')){
            // Show the bubble only at a specific interval, start time
            // refers to when the icon should appear
            return new IconLayer({ ...v,
                visible: currentTime.value >= v.time,
                updateTrigger: {
                    iconAtlas: showAnnotations.value
                }
            })
        } else if (k == 'AnimatedWind') {
            return new ParticleLayer({ ...v, 
                animationProgress: currentTime.value,
                updateTriggers: {
                    colorSetting : settings['Wind_Particle_Colors']
                }
            })
        } else {
            throw 'Error in animate'
        }
    })
    let curLayerList = layerList.concat(animatedLayerList)

    const colorInterp = (unmetDemand) => d3.interpolateReds(
        d3.scaleLinear().domain([-250, 10]).range([1, 0])(unmetDemand)
    ).replace(/[^\d,]/g, '').split(',').map(d => Number(d))

    const colorInterpDifference = (unmetDemand) => d3.interpolatePRGn(
        d3.scaleLinear().domain([-50, 50]).range([0, 1])(unmetDemand)
    ).replace(/[^\d,]/g, '').split(',').map(d => Number(d))

    let index = Math.round(currentTime.value * 1200)
    let layerBaseline = new GeoJsonLayer({
        id: 'Baseline',
        data: featureCollectionBaseline,
        filled: true,
        extruded: false,
        pickable: true,
        getFillColor: d => colorInterp(d.properties.unmetDemand[index]),
        // getFillColor: [255, 255, 255, 255],
        getLineColor: [0, 0, 0, 255],
        getLineWidth: 100,
        updateTriggers: {
            getFillColor: currentTime.value
        },
        onHover: (info) => {
            console.log(info.object?.properties.unmetDemand[index])
        },
    })

    let layerComparison = new GeoJsonLayer({
        id: 'Comparison',
        data: featureCollectionComparison,
        filled: true,
        extruded: false,
        pickable: true,
        getFillColor: d => colorInterp(d.properties.unmetDemand[index]),
        // getFillColor: [255, 255, 255, 255],
        getLineColor: [0, 0, 0, 255],
        getLineWidth: 100,
        updateTriggers: {
            getFillColor: currentTime.value
        },
        onHover: (info) => {
            console.log(info.object?.properties.unmetDemand[index])
        },
    })

    let layerDifference = new GeoJsonLayer({
        id: 'Difference',
        data: featureCollectionDifference,
        filled: true,
        extruded: false,
        pickable: true,
        getFillColor: d => colorInterpDifference(d.properties.difference[index]),
        // getFillColor: [255, 255, 255, 255],
        getLineColor: [0, 0, 0, 255],
        getLineWidth: 100,
        updateTriggers: {
            getFillColor: currentTime.value
        },
        onHover: (info) => {
            console.log(info.object?.properties.difference[index])
        },
    })
    // let curLayerList = layerList.concat([layerBaseline])
    // console.log(animatedLayerDescription)
    if (animatedLayerDescription.includes('Baseline deliveries')) {
        curLayerList.push(layerBaseline)
    }
    if (animatedLayerDescription.includes('bl_h000 deliveries')) {
        curLayerList.push(layerComparison)
    }
    if (animatedLayerDescription.includes('Difference in deliveries (bl_h000 - baseline)')) {
        curLayerList.push(layerDifference)
    }

    // console.log(animatedLayerDescription)
    console.log(curLayerList)
    return curLayerList
}

// Parent function to run the animation
function animate(){
    if (!running.value){
        return
    }
    // Increment the currentTime
    currentTime.value = (currentTime.value + 0.0001) % 1.0
    drawAllLayers()
    requestAnimationFrame(animate)
}

function handleViewChange(viewState: MapViewState): void{
    //console.log(viewState)
    deck.setProps({ viewState: { ...viewState } })
    useMapStore.changeViewState(viewState, props.mapID, props.mapType)
}

// Toggling functions to attach to the buttons
function toggleAnimation(){
    toggleAnimate.value = (running.value) ?  "pi-play" : "pi-pause" 
    running.value = !running.value
    animate()
}

const closeAnnotation = () => {
    showAnnotations.value = false
}
/*

function settingsChanged(updatedSettings){
    settings = {...settings, ...updatedSettings};
    drawAllLayers();
    console.log('setting changed', updatedSettings)
}

*/
// Attaches to the slider to format the tooltip on the slider - returns a string
function formatToolTip(value){
    return new Date(timeScale(value)).toLocaleDateString('en-us', { year:"numeric", month: "short" })
}

function sliderUpdate(){
    drawAllLayers()
}

</script>

<template>
    <div class="deck-container">
        <AnnotationPanel
            v-if="showAnnotations"
            :annotationPanelProps="curAnnotationsProps"
            @close-annotation-panel="closeAnnotation"
            @highlight-layers="highlightLayer"
        />
        <InfoPanel :settings="InfoPanelSettings" />
        <DeckGLToolTip
            v-if="showTooltip"
            :text="toolTipText"
        />
        <slot />
        <canvas
            :id="`deck-canvas-single-water-${props.mapID}`"
            class="deck-canvas-single-water"
        />
        <div
            id="button-slider"
            class="button-slider"
        >
            <Button
                :icon="`pi ${toggleAnimate}`"
                class="buttonArray p-button-rounded"
                @click="toggleAnimation()"
            />
            <Slider
                v-if="loaded"
                :id="`timeSlider-${props.mapID}`"
                v-model="currentTime"
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
.deck-canvas-single-water {
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
    height: 8vh;
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

.deck-container ol{
    text-align: left;
}

button {
    color: white;
    font-size: 0.7rem;
}

.buttonArray {
    position: relative; 
    height: 50%;
}

</style>
