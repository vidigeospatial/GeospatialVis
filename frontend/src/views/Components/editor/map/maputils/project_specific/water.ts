import { MapState } from '@/types/mapTypes'
import axios, { AxiosResponse } from "axios";
import type { Coords, LayerProp, InfoPanelProps, MapParamsType } from '@/types/mapTypes'
import type { LayersList, MapViewState, Layer } from '@deck.gl/core/typed'
import { 
    scaleLinear, 
    interpolateReds, 
    interpolateBlues, 
    interpolatePRGn, 
    ScaleTime, 
    scaleTime,
    timeYear,
    TimeInterval
} from "d3"
import InfoPanelSettings from '@/store/localdb/InfoPanelSettingsWater.json'

import { useAttrs, toRaw, Ref } from 'vue'

import { useMap } from '@/store/map'
// import { useData } from '@/store/data'
// import { useEditor } from '@/store/editor'
// import { useOverviewMap } from "@/store/overview"

// import { vueTileLayer } from "../layers/TileLayer"
// import { vueAnimatedProps } from "../layers/AnimatedProps_Fire"
// import { vueGeoJsonLayer } from '../layers/GeoJsonLayer'
// import { vueWeatherLayer } from '../layers/WeatherLayer'
// import { AnimatedPathLayer } from '../layers/AnimatedPath'
// import { AnimatedGridCellLayer } from '../layers/AnimatedGridCell'
// import { AnimatedHeatmapLayer } from '../layers/AnimatedHeatmap'
import { DraggableIconLayer } from '../layers/DraggableIconLayer'
import { useData } from '@/store/data'
// import ParticleLayer from '../layers/ParticleAdvection/particle-layer'
import { TextLayer, IconLayer } from '@deck.gl/layers'

import { GeoJsonLayer } from '@deck.gl/layers/typed'
import { IContentManager } from './project_specific.interface'

// import baselineUnmet from '@/assets/data/baseline_unmetdemand.json'
// import comparisonUnmet from '@/assets/data/comparison_unmetdemand.json'
// import differenceUnmet from '@/assets/data/difference_unmetdemand.json'
// import baselineGroundwater from '@/assets/data/baseline_groundwater.json'

export default class WaterContentManager implements IContentManager {
    useDataStore: any
    useMapStore: any
    useEditorStore: any
    attrs: any
    mapParams: MapParamsType
    animatedProps: { [key: string]: LayerProp }
    editorParams: any
    staticLayers: LayersList
    data: any

    constructor(
        mapParams: MapParamsType,
        editorParams: any,
        layerDescription: MapState.Layer<any>[]
    ) {
        this.useMapStore = useMap()
        this.useDataStore = useData()
        // this.useEditorStore = useEditor()

        this.attrs = useAttrs()
        this.mapParams = mapParams
        this.editorParams = editorParams

        // let animatedPropsObject = new vueAnimatedProps(mapParams.fireID)
        this.animatedProps = {}
        this.staticLayers = this.getAllStaticLayers(layerDescription)
        this.data = {}
        this.parseData()
    }

    parseData () {
        // let featureCollectionBaseline = {
        //     "type": 'FeatureCollection',
        //     "features": []
        // }
        // let featureCollectionComparison = {
        //     "type": 'FeatureCollection',
        //     "features": []
        // }
        // let featureCollectionDifference = {
        //     "type": 'FeatureCollection',
        //     "features": []
        // }
        // let featureCollectionBaselineGroundwater = {
        //     "type": 'FeatureCollection',
        //     "features": []
        // }

        let unmetdemand = this.useDataStore.getData('water', 'unmetdemand')
        let groundwater = this.useDataStore.getData('water', 'groundwater')
        let shapes = this.useDataStore.getData('water', 'shapes')
        shapes['demand_units'].features = shapes['demand_units'].features.filter(d => d.properties.DU_ID in unmetdemand['baseline'])

        let baseline_unmetdemand = shapes['demand_units'].features.map ( d => {
            return {
                ...d,
                properties: {
                    unmetDemand: Object.values(unmetdemand['baseline'][d.properties.DU_ID])
                }
            }   
        })
        let scenario_unmetdemand = shapes['demand_units'].features.map ( d => {
            return {
                ...d,
                properties: {
                    unmetDemand: Object.values(unmetdemand['scenario'][d.properties.DU_ID])
                }
            }   
        })
        let comparison_unmetdemand = shapes['demand_units'].features.map ( d => {
            let baseline: number[] = Object.values(unmetdemand['baseline'][d.properties.DU_ID])
            return {
                ...d,
                properties: {
                    difference: Object.values(unmetdemand['scenario'][d.properties.DU_ID]).map(
                        (element: number, index: number) => element - baseline[index]
                    )
                }
            }   
        })
        let baseline_groundwater = shapes['groundwater'].features.map ( d => {
            return {
                ...d,
                properties: {
                    groundwater: Object.values(groundwater['baseline'][d.properties.elem_id])
                }
            }   

        })


        // unmetdemand.forEach(
        //     (d: any) => {
        //         let parsed = JSON.parse(d[1200])
    
        //         featureCollectionBaseline.features.push({
        //             type: 'Feature',
        //             properties: {
        //                 unmetDemand: Object.values(d).slice(0, 1200),
        //             },
        //             geometry: {
        //                 type: parsed.type,
        //                 coordinates: parsed.coordinates
        //             }
        //         })
    
        //     }
        // )
    
        // comparisonUnmet.forEach(
        //     (d: any) => {
        //         let parsed = JSON.parse(d[1200])
    
        //         featureCollectionComparison.features.push({
        //             type: 'Feature',
        //             properties: {
        //                 unmetDemand: Object.values(d).slice(0, 1200),
        //             },
        //             geometry: {
        //                 type: parsed.type,
        //                 coordinates: parsed.coordinates
        //             }
        //         })
        //     }
        // )
    
        // differenceUnmet.forEach(
        //     (d: any) => {
        //         let parsed = JSON.parse(d[1200])
    
        //         featureCollectionDifference.features.push({
        //             type: 'feature',
        //             properties: {
        //                 difference: Object.values(d).slice(0, 1200),
        //             },
        //             geometry: {
        //                 type: parsed.type,
        //                 coordinates: parsed.coordinates
        //             }
        //         })
    
        //     }
        // )

        // baselineGroundwater.forEach(
        //     (d: any) => {
        //         let parsed = JSON.parse(d[1200])
    
        //         featureCollectionBaselineGroundwater.features.push({
        //             type: 'feature',
        //             properties: {
        //                 groundwater: Object.values(d).slice(0, 1200),
        //             },
        //             geometry: {
        //                 type: parsed.type,
        //                 coordinates: parsed.coordinates
        //             }
        //         })
    
        //     }
        // )

        this.data['baseline'] = baseline_unmetdemand
        this.data['comparison'] = scenario_unmetdemand
        this.data['difference'] = comparison_unmetdemand
        this.data['baselineGroundwater'] = baseline_groundwater
    }

    getAllStaticLayers(layerDescription: MapState.Layer<any>[]): LayersList {
        let layerList: LayersList = []
        return layerList
    }

    getCurrentStaticLayers(layerDescription: MapState.Layer<any>[]) : void {
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
            if (k.startsWith('Icons')) {
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
                        // onDrag: (info, event) => {
                        //     this.updateAnnotationLocation(info)
                        // },
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
            } else {
                throw 'Error in animate'
            }
        })


        const colorInterp = (unmetDemand) => interpolateReds(
            scaleLinear().domain([-250, 10]).range([1, 0])(unmetDemand)
        ).replace(/[^\d,]/g, '').split(',').map(d => Number(d))

        const colorInterpGW = (groundwater) => interpolateBlues(
            scaleLinear().domain([-250, 700]).range([0, 1])(groundwater)
        ).replace(/[^\d,]/g, '').split(',').map(d => Number(d))

        const colorInterpDifference = (unmetDemand) => interpolatePRGn(
            scaleLinear().domain([-50, 50]).range([0, 1])(unmetDemand)
        ).replace(/[^\d,]/g, '').split(',').map(d => Number(d))



        let index = Math.round(currentTime * 1200)
        let layerBaseline = new GeoJsonLayer({
            id: 'Baseline',
            data: this.data['baseline'],
            filled: true,
            extruded: false,
            pickable: true,
            getFillColor: d => colorInterp(d.properties.unmetDemand[index]),
            // getFillColor: [255, 255, 255, 255],
            getLineColor: [0, 0, 0, 255],
            getLineWidth: 100,
            opacity: 0.5,
            updateTriggers: {
                getFillColor: currentTime
            }
        })

        let layerComparison = new GeoJsonLayer({
            id: 'Comparison',
            data: this.data['comparison'],
            filled: true,
            extruded: false,
            pickable: true,
            getFillColor: d => colorInterp(d.properties.unmetDemand[index]),
            // getFillColor: [255, 255, 255, 255],
            getLineColor: [0, 0, 0, 255],
            getLineWidth: 100,
            opacity: 0.5,
            updateTriggers: {
                getFillColor: currentTime
            }
        })

        let layerDifference = new GeoJsonLayer({
            id: 'Difference',
            data: this.data['difference'],
            filled: true,
            extruded: false,
            pickable: true,
            getFillColor: d => colorInterpDifference(d.properties.difference[index]),
            // getFillColor: [255, 255, 255, 255],
            getLineColor: [0, 0, 0, 255],
            getLineWidth: 100,
            opacity: 0.5,
            updateTriggers: {
                getFillColor: currentTime
            }
        })

        let layerBaselineGroundwater = new GeoJsonLayer({
            id: 'BaselineGroundwater',
            data: this.data['baselineGroundwater'],
            filled: true,
            extruded: false,
            pickable: true,
            getFillColor: d => colorInterpGW(d.properties.groundwater[index]),
            // getFillColor: [0, 0, 0, 255],
            getLineColor: [255, 255, 255, 0],
            getLineWidth: 100,
            opacity: 0.5,
            updateTriggers: {
                getFillColor: currentTime
            }
        })
        // let curLayerList = layerList.concat([layerBaseline])
        // console.log(animatedLayerDescription)
        if (animatedLayerDescription.includes('Baseline deliveries')) {
            animatedLayerList.push(layerBaseline)
        }
        if (animatedLayerDescription.includes('bl_h000 deliveries')) {
            animatedLayerList.push(layerComparison)
        }
        if (animatedLayerDescription.includes('Difference in deliveries (bl_h000 - baseline)')) {
            animatedLayerList.push(layerDifference)
        }
        if (animatedLayerDescription.includes('Baseline GW deliveries')) {
            animatedLayerList.push(layerBaselineGroundwater)
        }
        // console.log(animatedLayerList)

        return animatedLayerList.concat(this.staticLayers)
    }

    getInitialViewState(): MapState.ViewState {
        // Random
        return {
            longitude: -122,
            latitude: 39,
            zoom: 9,
            pitch: 60,
            bearing: 30
        }
    }

    // Get the timeScale and inverseTimeScale, in order
    getTimeScales(): [ScaleTime<number, Date>, ScaleTime<Date, number>] {
        //temp
        // return [d3.scaleTime().domain([new Date(2018, 0, 1), new Date(2018, 11, 31)]).range([0, 1]), d3.scaleTime().domain([new Date(2018, 0, 1), new Date(2018, 11, 31)]).range([0, 1])]

        const start = '10/31/1921'
        const end = '9/30/2021'

        let timeScale = scaleTime<number, Date>()
            .range([new Date(start), new Date(end)])
            .domain([0, 1])
        let inverseTimeScale = scaleTime<Date, number>()
            .domain([new Date(start), new Date(end)])
            .range([0, 1])
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
        // If annoatations are showing, change the icon atlas (i.e. the image)
        if (showAnnotations.value == true)
            layers = layers.map(d => d.id == curAnnotationsProps.value.id.toString() ? d.clone({ iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png' }) : d)

        return layers
    }

    // updateAnnotationLocation(info) {
    //     const watchedIndex = this.useMapStore.deckGLMapState.findIndex(map => map._metaData.id == this.mapParams.mapID && map._metaData.active)
    //     let singleFireMapState = this.useMapStore.deckGLMapState[watchedIndex]._data as MapState.SingleFire
    //     let annotationID = info.layer.props.annotationID
    //     this.useEditorStore.slideState[this.editorParams.currentlyEditingSlideID].annotations.find(a => a.id == annotationID).location = info.coordinate
    //     singleFireMapState.annotations.find(a => a.id == annotationID).location = info.coordinate
    // }

    // Setup the settings object and the props for the InfoPanel
    setupSettings() {
        const settings: InfoPanelProps.Settings[] = InfoPanelSettings
        settings.forEach(element => {
            if ("options" in element) {
                element.options.forEach(option => { settings[option.emitVal] = option.default })
            }
        })
    }
    getTimeSliderScaleParams() : [ ScaleTime<number, number>, TimeInterval, string ] {
        const start = '10/31/1921'
        const end = '9/30/2021'
        let scale = scaleTime()
            .domain([new Date(start), new Date(end)])

        return [ scale, timeYear.every(5), "%Y" ]
    }
    formatTimeString(date: Date): string {
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
    }
    getInfoPanelSettings(): InfoPanelProps.Settings[] {
        return InfoPanelSettings
    }
}