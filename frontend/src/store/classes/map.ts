import axios, { AxiosResponse } from "axios"
import { MapState } from "../../types/mapTypes"
import { reactive, ref, Ref } from "vue"
import { useData as useDataStore } from "../data"
import { useWildfireList } from "../selectfire"
import overviewLL from '../localdb/overviewLL.json'
import singleFireLL from '../localdb/singleFireLL.json'
import singleWaterLL from '../localdb/singleWaterLL.json'

import * as d3 from "d3"

const ENDPOINT = "http://infovis.cs.ucdavis.edu/wildfire/api/firedash/"

const doesDataExist = (id: string, dataType: string) => id in useDataStore().data && useDataStore().data[id][dataType] != undefined


// class DBData implements MapState.DBData {
//     isFetched: boolean;
//     data: Array<any>

//     constructor(){
//         this.isFetched = false;
//         // this.data = reactive([])
//     }

// }

const config = {
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    }
}

export class SingleFire implements MapState.SingleFire {
    roads: MapState.DBData // = new DBData();
    perimeter: MapState.DBData // = new DBData();
    temperature: MapState.DBData //  = new DBData();
    humidity: MapState.DBData //  = new DBData();
    wind: MapState.DBData //  = new DBData();
    frp: MapState.DBData //  = new DBData();
    det: MapState.DBData //  = new DBData();
    population: MapState.DBData //  = new DBData();
    annotations: MapState.annotationData[]

    layerList: MapState.Layer<MapState.TileMap | MapState.GeoJSONMap> []

    fireID: string

    constructor(fireID:string, annotations: MapState.annotationData[]){
        this.fireID = fireID //"b08ce436-ff9f-4cf8-aafa-8b2212bc9e82"
        this.layerList = JSON.parse(JSON.stringify(singleFireLL))

        this.frp = reactive({ isFetched: false })
        this.det = reactive({ isFetched: false })
        this.roads = reactive({ isFetched: false })
        this.perimeter = reactive({ isFetched: false })
        this.humidity = reactive({ isFetched: false })
        this.temperature = reactive({ isFetched: false })
        this.wind = reactive({ isFetched: false })
        this.population = reactive({ isFetched: false })

        // TODO: How to handle annotations? Pass through constructor? 
        this.annotations = annotations
        // this.annotation_to_add = {id: -1, location: [-1,-1], text: "", timestamp: "", relevantLayers: []};
        // this.selected_location = [];

        const classThis = this


        //// --- PERIMETER -----
        // Check if the perimeter data is already in the store
        if (!doesDataExist(fireID, 'perimeter')){
            // TODO: Extend this to the other data types
            Promise.all([this.fetchPerimetersList()]).then(function(response: [AxiosResponse<any>]){
                let promises : any = [] 
                response[0].data.forEach((item: any) => {
                    promises.push(axios.post(ENDPOINT + 'wildfires/perimeter', {
                        state: "CA",
                        exact_date: item.date,
                        fire_id: fireID
                    }, config))
                })
                return Promise.all(promises)
            }).then(function(response: AxiosResponse<any>[]){
                let parsedPerimeter : any = []
                response.forEach((item: any) => {
                    parsedPerimeter.push({
                        perimeter: item.data.perimeter['coordinates'][0][0],
                        perimeter_date: item.data.date,
                        centroid: item.data.centroid['coordinates']
                    })
                })
                useDataStore().updateData(fireID, parsedPerimeter, 'perimeter', 'fire')
                classThis.perimeter.isFetched = true
                console.log('Exiting fetch perimeters')
            })
        } else {
            classThis.perimeter.isFetched = true
        }
        ////////////////////////////

        //// ---- FRP ----- 
        // Check if the FRP data is already in the store
        if (!doesDataExist(fireID, 'frp')){
            let fireData = useWildfireList().getWildfireByID(fireID) 
            this.fetchFRP(fireData.acres, JSON.parse(fireData.centroid), fireData.start_date, fireData.end_date).then(function(response: AxiosResponse<any>){
                let frpData = []
                response.data.forEach((item: any) => { 
                    frpData.push({
                        centroid: item.centroid['coordinates'],
                        confidence: item.confidence,
                        date: item.date,
                        footprint: item.footprint['coordinates'],
                        power: item.power,
                        processed_confidence: item.processed_confidence
                    })
                })
                useDataStore().updateData(fireID, frpData, 'frp', 'fire')
                classThis.frp.isFetched = true
                console.log('Exiting fetch FRP')
            })
        } else {
            classThis.frp.isFetched = true
        }
        ////////////////////////////
        
        //// ---- Roads ----- 
        // Check if the Roads data is already in the store
        if (!doesDataExist(fireID, 'roads')){
            this.fetchRoads().then(function(response: AxiosResponse<any>){
                let road_data = response.data.map( (item: any) => 
                    item.road )
                useDataStore().updateData(fireID, road_data, 'roads', 'fire')
                classThis.roads.isFetched = true
                console.log('Exiting fetch Roads')
            })
        } else {
            classThis.roads.isFetched = true
        }

        //// ---- Wind ----- 
        // Check if the wind data is already in the store
        // if (!doesDataExist(fireID, 'wind')){
        //     let fireData = useWildfireList().getWildfireByID(fireID) 
        //     let timeScale = d3.scaleTime<Date, number>().
        //         domain([0, 1]).
        //         range([new Date(fireData.start_date), new Date(fireData.end_date)])
        //     let intervals = 4

        //     const padWithZeros = num => num.toString().padStart(2, '0')
        //     const formatTimeForAPI = date => `${date.getFullYear()}-${padWithZeros(date.getMonth() + 1)}-${padWithZeros(date.getDate())} ${padWithZeros(date.getHours())}:${padWithZeros(date.getMinutes())}:${padWithZeros(date.getSeconds())}`

        //     let requests = []

        //     for (let i = 0; i < 1; i += 1 / intervals) {
        //         requests.push(this.fetchWind(
        //             formatTimeForAPI(timeScale(i)),
        //             formatTimeForAPI(timeScale(i + 1 / intervals))))
        //     }
        //     Promise.all(requests).then(function(response: AxiosResponse<any>[]){
        //         let windData = response.map(item => item.data)
        //         useDataStore().updateFireData(fireID, windData, 'wind')
        //         classThis.wind.isFetched = true
        //         console.log('Exiting fetch Roads')
        //     })

        //     // this.fetchWind(fireData.start_date, fireData.end_date).then(function(response){
        //     //     let wind_data = response.data
        //     //     useDataStore().updateFireData(fire_id, wind_data, 'wind');
        //     //     class_this.wind.isFetched = true;
        //     // });

        // } else {
        //     classThis.wind.isFetched = true
        // }

    }

    getDataFromStore(requestedData:string){
        return useDataStore().data[this.fireID][requestedData]
    }

    fetchPerimetersList(){
        const queryEP = ENDPOINT + "wildfires/perimeters/list"
        const body = { state: "CA", fire_id: this.fireID }
        return axios.post(queryEP, body, config)
    }
    //NEED to fire off the queries to get the data related to the current fire ID, have that be reactive and part of the store...

    //TODO: make this dynamic
    fetchFRP(areaAcres:number, centroid: object, startDate: string, endDate: string){
        const queryEP = ENDPOINT + 'fire/radiative_power'
        const body = {
            // Convert from acres to m2
            distance: Math.sqrt(areaAcres * 4046.86),
            origin_centroid: centroid,
            start_date: startDate,
            end_date: endDate
        }
        return axios.post(queryEP, body, config)
    }

    fetchDetections(){
        const queryEP = ENDPOINT + 'fire/detection'
        const body = {
            distance: 32244.5166854,
            origin_centroid:{ type:"Point",coordinates:[-120.065187687,37.841171175] },
            start_date: "2013-08-19 10:43:00",
            end_date: "2013-09-26 09:58:00"
        }
        return axios.post(queryEP, body, config)
    }

    fetchPopulationBlocks(){
        // /firedash/blocks
        const queryEP = ENDPOINT + 'blocks'
        const body =  { fire_id:this.fireID }
        return axios.post(queryEP, body, config)
    }

    fetchRoads(){
        // /firedash/roads
        const queryEP = ENDPOINT + 'roads'
        const body =  { fire_id:this.fireID }
        return axios.post(queryEP, body, config)
    }

    fetchWind(startDate: string, endDate: string): Promise<AxiosResponse<any>>{
        const queryEP = ENDPOINT + 'weather/grid'
        const body =  {
            fire_id: this.fireID,
            start_date: startDate,
            end_date: endDate
        }
        return axios.post(queryEP, body, config)
    }

}

export class OverviewFires implements MapState.OverviewFires {
    fireClusters: MapState.DBData
    selectedFire: MapState.DBData
    layerList: MapState.Layer<MapState.TileMap | MapState.GeoJSONMap> []
    annotations: MapState.annotationData[]
    
    constructor(){
        this.fireClusters = reactive({ isFetched: false })
        this.selectedFire = reactive({ isFetched: false })
        this.layerList = reactive(overviewLL)

        const classThis = this
        Promise.all([this.fetchOverviewClusters()]).then(function(results: AxiosResponse<any>[]){
            console.log("FETCHED DATA from AXIOS", results[0]['data'])
            classThis.fireClusters.isFetched = true
            classThis.fireClusters.data = [results[0]['data']]
        })
    }

    //TODO: should on create fire off queries to populate? Probably...
    fetchOverviewClusters(): Promise<AxiosResponse<any, any>> {
        const queryEP = ENDPOINT + 'perimeters/aggregate'
        return  axios.post(queryEP, { state: "CA" }, config)
    }
}

export class FireMap implements MapState.Map {
    _metaData: MapState.MapMetaData
    _viewState: MapState.ViewState
    _data : MapState.SingleFire | MapState.OverviewFires

    constructor(metaData: MapState.MapMetaData, viewState: MapState.ViewState, data: SingleFire | OverviewFires){
        this._metaData = metaData
        this._viewState = viewState
        this._data = data
    }
}

export class Water implements MapState.WaterData{
    data: MapState.DBData
    layerList: MapState.Layer<MapState.TileMap | MapState.GeoJSONMap>[]
    annotations: MapState.annotationData[]

    unmetdemand: MapState.DBData // = new DBData();
    groundwater: MapState.DBData //  = new DBData();

    shapes: MapState.DBData

    // In store -> { 'unmetdemand': { scenario_name: data ...}}

    currentTime: number

    // axios.get("http://infovis.cs.ucdavis.edu/wildfire/api/firedash/", config)


    constructor(annotations: MapState.annotationData[]){
        this.layerList = JSON.parse(JSON.stringify(singleWaterLL))
        this.annotations = annotations
        this.currentTime = undefined

        this.unmetdemand = reactive({ isFetched: false })
        this.groundwater = reactive({ isFetched: false })
        this.shapes = reactive({ isFetched: false })

        const classThis = this

        if (!doesDataExist('water', 'unmetdemand')){
            Promise.all(this.fetchUnmetdemand()).then(function(response: AxiosResponse<any>[]){
                let scenarios = [
                    'CS3_BL',
                    'bl_h000', 
                    'LTO_BA_EXP1_2022MED', 
                    'CS3_ALT3_2022med_L2020ADV', 
                    'CS3_ALT3_2040MED_COEQ20230821_L2020DV', 
                    'CS3_NAA_2022MED_071923_L2020ADV', 
                    'CS3_NAA_2040MED_COEQ20230818_L2020ADV'
                ]
                let unmetDemand = {}
                response.forEach( (item, index) => unmetDemand[scenarios[index]] = item.data)
                useDataStore().updateData('water', unmetDemand, 'unmetdemand', 'water')
                classThis.unmetdemand.isFetched = true
            })
        } else {
            classThis.unmetdemand.isFetched = true
        }

        if (!doesDataExist('water', 'groundwater')){
            Promise.all(this.fetchGroundwater()).then(function(response: AxiosResponse<any>[]){
                let groundwater = {
                    'baseline': response[0].data,
                    'scenario': response[1].data
                }
                useDataStore().updateData('water', groundwater, 'groundwater', 'water')
                classThis.groundwater.isFetched = true
            })
        } else {
            classThis.groundwater.isFetched = true
        }

        if (!doesDataExist('water', 'shapes')){
            Promise.all([this.fetchDemandUnitShapes(), this.fetchGroundwaterShapes()]).then(function(response: AxiosResponse<any>[]){
                response[0].data.features = response[0].data.features.filter( d => {
                    return d.properties['DU_ID'] != null
                })
                let shapes = {
                    'demand_units': response[0].data,
                    'groundwater': response[1].data
                }
                useDataStore().updateData('water', shapes, 'shapes', 'water')
                classThis.shapes.isFetched = true
            })
        } else {
            classThis.shapes.isFetched = true
        }

    }

    fetchUnmetdemand(){
        let scenarios = [
            'CS3_BL',
            'bl_h000', 
            'LTO_BA_EXP1_2022MED', 
            'CS3_ALT3_2022med_L2020ADV', 
            'CS3_ALT3_2040MED_COEQ20230821_L2020DV', 
            'CS3_NAA_2022MED_071923_L2020ADV', 
            'CS3_NAA_2040MED_COEQ20230818_L2020ADV'
        ]
        return scenarios.map( scenario => {
            const queryEP = `http://infovis.cs.ucdavis.edu/geospatial/api/data/scenario/${scenario}/unmetdemand`
            return axios.get(queryEP, config)
        })
    }

    fetchGroundwater(){
        const queryEPBaseline = "http://infovis.cs.ucdavis.edu/geospatial/api/data/baseline_groundwater"
        const queryEPScenario = "http://infovis.cs.ucdavis.edu/geospatial/api/data/bl_h000_groundwater"
        return [
            axios.get(queryEPBaseline, config),
            axios.get(queryEPScenario, config),
        ]
    }

    fetchDemandUnitShapes(){
        const queryEP = "http://infovis.cs.ucdavis.edu/geospatial/api/shapes/demand_units"
        return axios.get(queryEP, config)
    }

    fetchGroundwaterShapes(){
        const queryEP = "http://infovis.cs.ucdavis.edu/geospatial/api/shapes/groundwater"
        return axios.get(queryEP, config)
    }
}

export class WaterMap implements MapState.Map {
    _metaData: MapState.MapMetaData
    _viewState: MapState.ViewState
    _data : Water

    constructor(metaData: MapState.MapMetaData, viewState: MapState.ViewState, data: Water){
        this._metaData = metaData
        this._viewState = viewState
        this._data = data

    }
}