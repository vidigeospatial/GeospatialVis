import { defineStore } from 'pinia'
import { MapState } from "../types/mapTypes"
import { FireMap, OverviewFires, SingleFire } from './classes/map'
import type { MapViewState } from '@deck.gl/core/typed'
import { ref } from 'vue'

interface State {
    deckGLMapState: MapState.Map[],
    accessToken: string,
    mapStyle: string
}

export const useMap = defineStore('singleMap', {
    state: () : State => ({
        deckGLMapState: [] as MapState.Map[],
        accessToken: "pk.eyJ1Ijoia2Rhc3UiLCJhIjoiY2tiMml3dDhjMDRrNTJ6cGgzdzBweTZmaCJ9.-HeZjTEqnQE8PYKvtcqNjg",
        mapStyle: "mapbox://styles/haxzie/ck0aryyna2lwq1crp7fwpm5vz",
    }),
    getters: {
        // Check if a map state exists with given id
        mapStateExists: (state): (mapID: string, mapType: string) => boolean => (mapID: string, mapType) => state.deckGLMapState.length > 0 ? state.deckGLMapState.some( (deckMapState) => deckMapState._metaData.id === mapID && deckMapState._metaData.mType == mapType && deckMapState._metaData.active) : false,
        // Check if data is ready for a given map ID
        isDataReady: (state): (mapID: string, mapType: string, dataKey: string) => boolean => (mapID: string, mapType: string, dataKey: string) => {
            let status = state.deckGLMapState.some( (deckMapState) => deckMapState._metaData.id === mapID &&  deckMapState._metaData.mType == mapType && deckMapState._metaData.active)
            console.log("Map Status: ", status, mapID, dataKey)
            if(status){
                const map = state.deckGLMapState.find( (deckMapState) => deckMapState._metaData.id === mapID && deckMapState._metaData.mType == mapType && deckMapState._metaData.active)
                const data : any = map?._data
                status = data[dataKey].isFetched 
                console.log("Data Status: ", status, map, mapID, dataKey)
            }
            return status
        }
    },
    actions: {
        findActiveIDX(this: State, mapID: string, mapType: string): number{
            // returns the index of the active singlefire - assume there is one
            let activeIDX = -1
            try{
                activeIDX = this.deckGLMapState.findIndex( (deckMapState) => deckMapState._metaData.id == mapID && deckMapState._metaData.mType == mapType && deckMapState._metaData.active)
            }catch(err){
                console.error('Error finding active single fire IDX', err)
            }
            return activeIDX
        },
        deactivateMapState(this: State, mapType: string, mapID: string): void{
            let map = this.deckGLMapState.find( (deckMapState: FireMap) => deckMapState._metaData.mType === mapType && deckMapState._metaData.id === mapID && deckMapState._metaData.active)
            map._metaData.active = false
        },
        updateGLMapState(this: State, mapID: string, mapType: string, newState: FireMap): void {
            // const index = this.deckGLMapState.findIndex(maps => maps.id == id)
            const index = this.deckGLMapState.findIndex( (mapStates: FireMap) => mapStates._metaData.id === mapID && mapStates._metaData.mType == mapType)
            if (index === -1) {
                throw Error(`No FireMap found with id: ${mapID}`)
            }
            this.deckGLMapState[index] = newState
        },
        getMapStateComponents(
            this: State,
            mapID: string,
            mapType: string,
        ): [MapState.MapMetaData, MapState.ViewState] {
            const metaData = {
                'id': mapID,
                'name': `${mapType}-${mapID}`,
                'mType': mapType,
                'active': true,
            }
            let viewState = {
                latitude: 38.544907,
                longitude: -121.740517,
                zoom: 6,
                pitch: 0,
                bearing: 0
            }
            return [metaData, viewState]
        
            // let data = (mapType.includes('overview')) ? new OverviewFires() : new SingleFire(fire_id, annotations)
            // let mapState = new FireMap(metaData, viewState, data)
            // let mapState = new FireMap(metaData, viewState, null)
            // console.log("TS Map State ", mapState)
        },
        addDeckMapState(this: State, mapState: MapState.Map): void {
            this.deckGLMapState = [mapState, ...this.deckGLMapState]
            // this.deckGLMapState.push(mapState)
        },
        getMapStateByID(this: State, mapID:string, mapType: string) : MapState.Map {
            console.log("Searching for Map ID ", mapID, "in array ", this.deckGLMapState)
            return this.deckGLMapState.find((mapStates) => mapStates._metaData.id ===  mapID && mapStates._metaData.mType == mapType)
        },
        // get the layer list of active map with given type
        getLayerList(this: State, mapID:string, mapType:string): MapState.Layer<any>[] {
            let state: MapState.Map = this.deckGLMapState.find((mapStates) => mapStates._metaData.mType == mapType && mapStates._metaData.id.includes(mapID) && mapStates._metaData.active)
            return state._data.layerList
        },
        updateLayerListState(this: State, newLayerList: MapState.Layer<any>[], mapID:string, mapType: string): void{
            let map = this.deckGLMapState.find( (deckMapState: FireMap) => deckMapState._metaData.mType === mapType && deckMapState._metaData.id === mapID && deckMapState._metaData.active)
            map._data.layerList = newLayerList
        },
        changeViewState(this: State, viewState: MapViewState, mapID: string, mapType: string) : void{
            const index = this.deckGLMapState.findIndex( (mapStates) => mapStates._metaData.id === mapID && mapStates._metaData.mType == mapType && mapStates._metaData.active)
            if (index < 0)
                return
            // Need to update each element and not the whole object to maintain reactivity
            this.deckGLMapState[index]._viewState.bearing = viewState.bearing
            this.deckGLMapState[index]._viewState.latitude = viewState.latitude
            this.deckGLMapState[index]._viewState.longitude = viewState.longitude
            this.deckGLMapState[index]._viewState.pitch = viewState.pitch
            this.deckGLMapState[index]._viewState.zoom = viewState.zoom
        },
        changeViewStateIDX(this: State, index: number, viewState: MapViewState) : void{
            this.deckGLMapState[index]._viewState.bearing = viewState.bearing
            this.deckGLMapState[index]._viewState.latitude = viewState.latitude
            this.deckGLMapState[index]._viewState.longitude = viewState.longitude
            this.deckGLMapState[index]._viewState.pitch = viewState.pitch
            this.deckGLMapState[index]._viewState.zoom = viewState.zoom
        },
        changeTimeIDX(this: State, index: number, time: number) : void{
            this.deckGLMapState[index]._data.currentTime = time
        },
        setAnnotationHighlighted(mapID: string, mapType: string, annotationID: number, highlighted: boolean){
            let activeIDX = this.findActiveIDX(mapID, mapType)
            if(activeIDX >= 0){
                let activeMap = this.deckGLMapState[activeIDX]
                let annotationIDX = activeMap._data.annotations.findIndex( (annotation) => annotation.id == annotationID)
                if(annotationIDX >= 0){
                    activeMap._data.annotations[annotationIDX].highlighted = highlighted
                }
            }
        }
            
    }
})
