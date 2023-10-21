import { project } from "@deck.gl/core/typed"
import { PROJECTION_MODE } from "@deck.gl/core/typed/lib/constants"

export const MAP_STYLES = {
    SATELLITE: 'mapbox://styles/mapbox/satellite-v9',
    DARK: 'mapbox://styles/mapbox/dark-v11',
    LIGHT: 'mapbox://styles/mapbox/light-v11',
    TEST: 'mapbox://styles/mapbox/satellite-streets-v12'
} as const

interface viewStateType {
    latitude: number,
    longitude: number,
    zoom: number,
    pitch: number,
    bearing: number
}

export const INITIAL_VIEW_STATE: viewStateType = {
    latitude: 38,
    longitude: -117,
    zoom: 4,
    pitch: 0,
    bearing: 0,
    // latitude: 37.86,
    // longitude: -120.02,
    // zoom: 11,
    // pitch: 80,
    // bearing: 20,
}

interface mapboxSettings {
    container: string
    width: string,
    style: string,
    interactive: boolean,
    center: any,
    zoom: number,
    bearing: number,
    pitch: number
    projection?: string

}
export const MAPBOX_OVERVIEW_SETTINGS: mapboxSettings = {
    container: 'map-overview',
    width: '100%',
    style: MAP_STYLES.DARK,
    interactive: false,
    center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
    zoom: INITIAL_VIEW_STATE.zoom,
    bearing: INITIAL_VIEW_STATE.bearing,
    pitch: INITIAL_VIEW_STATE.pitch
}

export const MAPBOX_DETAIL_SETTINGS: mapboxSettings = {
    container: 'map-detail',
    width: '100%',
    style: MAP_STYLES.LIGHT,
    interactive: false,
    center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
    zoom: INITIAL_VIEW_STATE.zoom,
    bearing: INITIAL_VIEW_STATE.bearing,
    pitch: INITIAL_VIEW_STATE.pitch,
    projection: 'mercator'
}

export const MAPBOX_SINGLEFIRE_SETTINGS: mapboxSettings = {
    container: 'map-single-fire',
    width: '100%',
    style: MAP_STYLES.LIGHT,
    interactive: false,
    center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
    zoom: INITIAL_VIEW_STATE.zoom,
    bearing: INITIAL_VIEW_STATE.bearing,
    pitch: INITIAL_VIEW_STATE.pitch,
    projection: 'mercator'
}

export const DECKGL_SETTINGS = {
    canvas: "deck-canvas",
    width: "100%",
    height: "100%",
    controller: true,
    
    initialViewState: INITIAL_VIEW_STATE,
}
