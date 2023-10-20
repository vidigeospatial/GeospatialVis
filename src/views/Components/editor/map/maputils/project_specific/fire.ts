import { MapState } from '@/types/mapTypes'
import { Slide } from '@/types/storiesTypes'
import type { Coords, LayerProp, InfoPanelProps, MapParamsType } from '@/types/mapTypes'
import type { LayersList, MapViewState, Layer } from '@deck.gl/core/typed'
import * as d3 from "d3"
import InfoPanelSettings from '@/store/localdb/InfoPanelSettingsFire.json'

import { useAttrs, toRaw, Ref } from 'vue'

import { useMap } from '@/store/map'
import { useData } from '@/store/data'
// import { useEditor } from '@/store/editor'
import { useOverviewMap } from "@/store/overview"

import { vueTileLayer } from "../layers/TileLayer"
import { vueAnimatedProps } from "../layers/AnimatedProps_Fire"
import { vueGeoJsonLayer } from '../layers/GeoJsonLayer'
import { vueWeatherLayer } from '../layers/WeatherLayer'
import { AnimatedPathLayer } from '../layers/AnimatedPath'
import { AnimatedGridCellLayer } from '../layers/AnimatedGridCell'
import { AnimatedHeatmapLayer } from '../layers/AnimatedHeatmap'
import { DraggableIconLayer } from '../layers/DraggableIconLayer'
import ParticleLayer from '../layers/ParticleAdvection/particle-layer'
import { TextLayer, IconLayer } from '@deck.gl/layers'

import { IContentManager } from './project_specific.interface'

export default class FireContentManager implements IContentManager {
    perimeterData: any[]
    overviewStore: any
    useDataStore: any
    useMapStore: any
    useEditorStore: any
    attrs: any
    mapParams: MapParamsType
    animatedProps: { [key: string]: LayerProp }
    editorParams: any
    staticLayers: LayersList

    constructor(
        mapParams: MapParamsType,
        editorParams: any,
        layerDescription: MapState.Layer<any>[]
    ) {
        this.overviewStore = useOverviewMap()
        this.useMapStore = useMap()
        this.useDataStore = useData()
        // this.useEditorStore = useEditor()

        this.perimeterData = this.useDataStore.getPerimeterData(mapParams.fireID)
        this.attrs = useAttrs()
        this.mapParams = mapParams
        this.editorParams = editorParams

        let animatedPropsObject = new vueAnimatedProps(mapParams.fireID)
        this.animatedProps = animatedPropsObject.getAnimatedProps()
        this.staticLayers = this.getAllStaticLayers(layerDescription)
    }

    getAllStaticLayers(layerDescription: MapState.Layer<any>[]): LayersList {
        let layerList: LayersList = []
        // let animatedLayerDescription: string[] = []
        layerDescription.forEach(element => {
            if (element["type"] == "TileLayer") {
                let tileLayer = new
                vueTileLayer(element["parameters"]["url"], this.attrs,
                    element["name"])
                layerList.push(tileLayer.create(true))
            } else if (element["type"] == "GeoJSON") {
                let geoLayer = new
                vueGeoJsonLayer(element["parameters"]["url"], this.attrs,
                    element["name"],
                    this.overviewStore.getOverviewClusters) //overviewlayer
                layerList.push(geoLayer.create(true, this.mapParams.fireID))
            } else if (element["type"] == "Wind") {
                // let windLayer = new vueWeatherLayer()
                // layerList.push(toRaw(windLayer.createWindLayer(element["visibility"], mapParams.fireID)))
                // layerList.push(toRaw(windLayer.createWindLayer(true, this.mapParams.fireID)))
            }
        })
        return layerList
    }

    getCurrentStaticLayers(layerDescription: MapState.Layer<any>[]) : void {
        layerDescription.forEach(element => {
            this.staticLayers = this.staticLayers.map((layer: Layer) => {
                if (element["name"] == layer.id && element["visibility"]) {
                    return layer.clone({ visible: true }) 
                } else if (element["name"] == layer.id && !element["visibility"]) {
                    return layer.clone({ visible: false }) 
                } else {
                    return layer
                }
            })
        })
    }

    getAllLayerProps(
        layerDescription: MapState.Layer<any>[],
        currentTime: number,
        settings: Record<string, string | boolean | number>,
        mapMode: string,
        showAnnotations: Ref<boolean>,
        annotationDragged: Ref<boolean>,
        deck: any,
    ): LayersList {
        // Filter out invisible layers
        this.getCurrentStaticLayers(layerDescription)

        let animatedLayerDescription: string[] = []
        layerDescription.forEach(element => {
            // If the layer has an animated component, then add it to the animatedLayerDescription
            if (element.animated && element.visibility)
                animatedLayerDescription.push(element.name)
        })

        let filteredAnimatedLayerProps = Object.entries(this.animatedProps).filter(
            ([k, v]) => 

                // This is a hack right now
                // Multiple DECKGL layers can correspond to one layer (from the user perspective)
                // e.g. Satellite_0 and Satellite_1 both deal with the Satellite layer
                // so split with '_' and grab the first element
                k.startsWith('Animated') ? animatedLayerDescription.includes(v.id.split('_')[0]) : true
        )
        let curAnimatedLayerProps = Object.fromEntries(filteredAnimatedLayerProps)

        // Build the animated layer list
        let animatedLayerList = Object.entries(curAnimatedLayerProps).map(([k, v]) => {
            if (k == 'AnimatedPath') {
                return new AnimatedPathLayer({
                    ...v,
                    animationProgress: currentTime,
                    getPath: data => data.path,
                    updateTriggers: {
                        getPath: settings['Perimeter_Smooth']
                    }
                })
            }
            else if (k == 'AnimatedGridCell') { return new AnimatedGridCellLayer({ ...v, animationProgress: currentTime, }) }
            else if (k == 'AnimatedHeatmap') { return new AnimatedHeatmapLayer(v) }
            else if (k == 'AnimatedTextIcons') { return new TextLayer(v) }
            else if (k.startsWith('Icons')) {
                // Show the bubble only at a specific interval, start time
                // refers to when the icon should appear
                // The icon layer depends on the mapMode
                if (mapMode == "Viewing") {
                    return new IconLayer({
                        ...v,
                        visible: currentTime >= v.time,
                        sizeScale: v.highlighted ? 8 : 4,
                        updateTriggers: {
                            iconAtlas: showAnnotations.value,
                            sizeScale: v.highlighted
                        }
                    })
                } else if (mapMode == "Editing") {
                    return new DraggableIconLayer({
                        ...v,
                        sizeScale: v.highlighted ? 8 : 4,
                        onDragStart: (info, event) => {
                            deck.setProps({ controller: { dragPan: false } })
                            annotationDragged.value = true
                        },
                        onDrag: (info, event) => {
                            this.updateAnnotationLocation(info)
                        },
                        onDragEnd: (info, event) => {
                            deck.setProps({ controller: true })
                            annotationDragged.value = false
                        },
                        visible: currentTime >= v.time,
                        updateTriggers: {
                            getPosition: annotationDragged.value,
                            sizeScale: v.highlighted
                            // iconAtlas: showAnnotations.value
                        },
                    })
                } else {
                    throw 'Unrecognized mapMode in getAllLayerProps'
                }
            } else if (k == 'AnimatedWind') {
                console.log("AnimatedWind", v)
                return new ParticleLayer({
                    ...v,
                    animationProgress: currentTime,
                    updateTriggers: {
                        colorSetting: settings['Wind_Particle_Colors']
                    }
                })
            } else {
                throw 'Error in animate'
            }
        })

        return animatedLayerList.concat(this.staticLayers)
    }

    getInitialViewState(): MapState.ViewState {
        // Random
        return {
            longitude: this.perimeterData[0].centroid[0],
            latitude: this.perimeterData[0].centroid[1],
            zoom: 11,
            pitch: 0,
            bearing: 0
        }
    }

    // Get the timeScale and inverseTimeScale, in order
    getTimeScales(): [d3.ScaleTime<number, Date>, d3.ScaleTime<Date, number>] {
        //temp
        // return [d3.scaleTime().domain([new Date(2018, 0, 1), new Date(2018, 11, 31)]).range([0, 1]), d3.scaleTime().domain([new Date(2018, 0, 1), new Date(2018, 11, 31)]).range([0, 1])]

        let timeScale = d3.scaleTime<number, Date>()
            .domain([0, 1])
            .range([this.animatedProps['AnimatedPath']['data'][0]['time'],
                this.animatedProps['AnimatedPath']['data'][this.animatedProps['AnimatedPath']['data'].length - 1]['time']])
        let inverseTimeScale = d3.scaleTime<Date, number>()
            .range([0, 1])
            .domain([this.animatedProps['AnimatedPath']['data'][0]['time'], this.animatedProps['AnimatedPath']['data'][this.animatedProps['AnimatedPath']['data'].length - 1]['time']])
        return [timeScale, inverseTimeScale]
    }

    buildSettings(): Record<string, string | boolean | number> {
        return {}
    }

    handleSettings(
        settings: Record<string, string | boolean | number>,
        layers: Layer<any>[],
        showAnnotations: Ref<boolean>,
        curAnnotationsProps: Ref<MapState.annotationData>
    ): LayersList {
        // Show arrows for wind?
        if (settings['Wind_Arrows'] == false)
            layers = layers.map(d => d.id == 'Wind_Arrows' ? d.clone({ visible: false }) : d)

        // Show particle advection for wind?
        if (settings['Wind_Particle'] == false)
            layers = layers.map(d => d.id == 'Wind_Particle' ? d.clone({ visible: false }) : d)

        // Smooth the perimeters?
        if (settings['Perimeter_Smooth'] == true)
            layers = layers.map(d => d.id == 'Perimeter' ? d.clone({ getPath: data => data.smoothed_path }) : d)

        if (settings['Wind_Particle_Colors'] == 'No Color')
            layers = layers.map(d => d.id == 'Wind_Particle' ? d.clone({ colorSetting: 0. }) : d)
        if (settings['Wind_Particle_Colors'] == 'Temperature')
            layers = layers.map(d => d.id == 'Wind_Particle' ? d.clone({ colorSetting: 1. }) : d)
        if (settings['Wind_Particle_Colors'] == 'Humidity')
            layers = layers.map(d => d.id == 'Wind_Particle' ? d.clone({ colorSetting: 2. }) : d)

        // If annoatations are showing, change the icon atlas (i.e. the image)
        if (showAnnotations.value == true)
            layers = layers.map(d => d.id == curAnnotationsProps.value.id.toString() ? d.clone({ iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png' }) : d)

        return layers
    }

    updateAnnotationLocation(info) {
        const watchedIndex = this.useMapStore.deckGLMapState.findIndex(map => map._metaData.id == this.mapParams.mapID && map._metaData.active)
        let singleFireMapState = this.useMapStore.deckGLMapState[watchedIndex]._data as MapState.SingleFire
        let annotationID = info.layer.props.annotationID
        // this.useEditorStore.currentPresentation[this.editorParams.slideID].annotations.find(a => a.id == annotationID).location = info.coordinate
        let slideState: Slide = this.useEditorStore.currentPresentation[this.editorParams.slideID]

        // Single map
        if (slideState['annotations']) {
            this.useEditorStore.currentPresentation[this.editorParams.slideID].annotations.find(a => a.id == annotationID).location = info.coordinate
        } else {
            if (this.mapParams.mapID == slideState['LeftMapParams'].mapID){
                this.useEditorStore.currentPresentation[this.editorParams.slideID].annotations_left.find(a => a.id == annotationID).location = info.coordinate
            }
            if (this.mapParams.mapID == slideState['RightMapParams'].mapID){
                this.useEditorStore.currentPresentation[this.editorParams.slideID].annotations_right.find(a => a.id == annotationID).location = info.coordinate
            }
        }

        singleFireMapState.annotations.find(a => a.id == annotationID).location = info.coordinate
    }

    // Setup the settings object and the props for the InfoPanel
    setupSettings() {
        const settings: InfoPanelProps.Settings[] = InfoPanelSettings
        settings.forEach(element => {
            if ("options" in element) {
                element.options.forEach(option => { settings[option.emitVal] = option.default })
            }
        })
    }
    getTimeSliderScaleParams() : [ d3.ScaleTime<number, number>, d3.TimeInterval, string ] {
        let scale = d3.scaleTime<number, number>()
            .domain([this.animatedProps['AnimatedPath']['data'][0]['time'],
                this.animatedProps['AnimatedPath']['data'][this.animatedProps['AnimatedPath']['data'].length - 1]['time']])
        return [ scale, d3.timeWeek.every(1), "%b %d" ]
    }
    formatTimeString(date: Date): string {
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()} ${date.getHours()}:00`
    }
    getInfoPanelSettings(): InfoPanelProps.Settings[] {
        return InfoPanelSettings
    }

}