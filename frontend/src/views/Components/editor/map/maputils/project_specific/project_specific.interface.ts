import { MapState } from '@/types/mapTypes'
import { Ref } from 'vue'
import { Coords, LayerProp, InfoPanelProps, MapParamsType } from '@/types/mapTypes'
import type { LayersList, MapViewState, Layer } from '@deck.gl/core/typed'
import * as d3 from "d3"

export interface IContentManager {
    useDataStore: any
    useMapStore: any
    useEditorStore: any
    attrs: any
    mapParams: MapParamsType
    editorParams: any

    staticLayers: LayersList
    animatedProps: { [key: string]: LayerProp }

    getAllStaticLayers(layerDescription: MapState.Layer<any>[]): LayersList 
    getCurrentStaticLayers(layerDescription: MapState.Layer<any>[]) : void 
    getAllLayerProps(
        layerDescription: MapState.Layer<any>[],
        currentTime: number,
        settings: Record<string, string | boolean | number>,
        mapMode: string,
        showAnnotations: Ref<boolean>,
        annotationDragged: Ref<boolean>,
        deck: any,
    ): LayersList
    getInitialViewState(): MapState.ViewState
    getTimeScales(): [d3.ScaleTime<number, Date>, d3.ScaleTime<Date, number>]
    buildSettings(): Record<string, string | boolean | number>
    handleSettings(
        settings: Record<string, string | boolean | number>,
        layers: LayersList,
        showAnnotations: Ref<boolean>,
        curAnnotationsProps: Ref<MapState.annotationData>
    ): LayersList 
    setupSettings() : void
    getTimeSliderScaleParams() : [ d3.ScaleTime<number, number>, d3.TimeInterval, string ] 
    formatTimeString(date: Date) : string
    getInfoPanelSettings() : InfoPanelProps.Settings[]
}

export interface IContentManagerConstructor {
    new(mapParams: MapParamsType, editorParams: any, layerList: MapState.Layer<any>[]): IContentManager
}

export function createContentManager(
    ctor: IContentManagerConstructor,
    mapParams: MapParamsType,
    editorParams: any,
    layerList: MapState.Layer<any>[]
): IContentManager {
    return new ctor(mapParams, editorParams, layerList)
}
