import { defineStore } from 'pinia'
import { MapParamsType } from "../types/mapTypes"

interface State {
    parentMapParams: MapParamsType,
    mapParamsList: MapParamsType[]
}

export const useSmallMultiples = defineStore('smallMultiples', { 
    state: (): State => ({
        parentMapParams: {} as MapParamsType,
        mapParamsList: [] as MapParamsType[],
    }),
    actions: {
        setParentMapParams(this: State, mapParams: MapParamsType): void{
            this.parentMapParams = mapParams
        },
        initializeMapParamsList(this: State): void{
            this.mapParamsList = [ {
                ...this.parentMapParams,
                mapType: this.parentMapParams.mapType + "SM",
                mapID: "0"
            }]
            for (let i = 0; i < 6; i++) {
                this.mapParamsList.push({
                    ...this.parentMapParams,
                    mapType: this.parentMapParams.mapType + "SM",
                    mapID: i.toString()
                })

            }
        }
    }
})