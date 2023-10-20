import { defineStore } from 'pinia'
import axios from "axios"

import identifiers from '../store/localdb/identifiers.json'

const config = {
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    }
}

//In the pineapple world parameters are not ok O__O

export const useWildfireList = defineStore('wildfireList', {
    state: () => ({
        // Make selectedFire and validFire a map from mapIdentifier to fire_id
        // 0: Overview - One fire
        // 1: Single Fire - One fire
        // 2: Fire Comparison - Left Fire
        // 3: Fire Comparison - Right Fire
        validFire: {
            [identifiers['mapIdentifier']['Overview']] : false, 
            [identifiers['mapIdentifier']['SingleFire']] : false, 
            [identifiers['mapIdentifier']['FireComparisonLeft']] : false, 
            [identifiers['mapIdentifier']['FireComparisonRight']] : false },
        fire: {},
        fireList: [],
        isFireListReady: false,
    }),
    getters: {
        getWildFiresYearRange() {
            let fireDates = this.fireList.map(wildfire => (wildfire.fire_year < 1) ?  new Date( wildfire.start_date).getUTCFullYear()  : new Date( wildfire.fire_year , 0).getUTCFullYear())
            let fireRange = new Set<number>(fireDates)
            return fireRange
        },
        getWildFiresAcresRange() {
            return this.fireList.map(wildfire => parseInt(wildfire.acres)) // string -> int
        },
        getWildFirePerimeters() {
            let perimeters = this.fireList.map(wildfire => +wildfire.perimeter_count) //string -> int
            return perimeters.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0))
        },
        getWildfireNames() {
            return this.fireList.map(wildfire => wildfire.name) //string
        },
        getWildFirePrettifyList() {
            //TODO: add centroid for icon layer
            return this.fireList.map((wildfire, index) => {
                let year = (wildfire.fire_year < 1) ?  new Date( wildfire.start_date).getUTCFullYear()  : new Date( wildfire.fire_year , 0).getUTCFullYear() //(wildfire['fire_year'] == undefined) ? wildfire['start_date'] : wildfire['fire_year']
                return {
                    name: wildfire.name,
                    year: wildfire.fire_year,
                    acres: parseInt(wildfire.acres),
                    perimeters: wildfire.perimeter_count,
                    centroid: wildfire.centroid,
                    id: wildfire.id,
                    key: index
                }
            })
        }
    },
    actions: {
        selectFireChange(selectedFire) {

            this.validFire = false

            if (selectedFire.id !== -1){
                this.validFire = true
            }
        },
        getWildfireByID(id) {
            return this.fireList.find(wildfire => wildfire.id === id) //string
        },
        getWildfireByName(name) {
            return this.fireList.find(wildfire => wildfire.name === name) //string
        },
        getWildfiresByYear(year) {
            return this.fireList.filter(wildfire => wildfire.fire_year === year) 
        },
        getWildfiresUntilYear(year) {
            return this.fireList.filter(wildfire => wildfire.fire_year <= year) 
        },
        getWildfiresByYearAndAcres(year, acresUpperBound) {
            let wildfires = this.fireList.filter(wildfire => wildfire.fire_year === year)
            return wildfires.filter(wildfire => {
                let acres = (isNaN(wildfire.acres) || wildfire.acres === null) ? 0 : wildfire.acres
                return (wildfire => acres <= acresUpperBound)
            })
        },
        async fetchFireList() {
            this.isFireListReady = false
            try {
                const data = await axios.post('http://infovis.cs.ucdavis.edu/wildfire/api/firedash/wildfires/list', { state: "CA" }, config)
                this.fireList = data.data
                this.isFireListReady = true
                console.log("Fire List Is Ready", data.data[0])
            }
            catch (error) {
                console.log('error :>> ', error)
                throw error.message
            }
        },
        // fetchDataForFire(fire_id){
            
        //     axios.post('http://infovis.cs.ucdavis.edu/wildfire/api/firedash/wildfires/perimeters/list', {
        //         state: "CA", 
        //         fire_id: fire_id
        //     }, config)
        //     .then((function(response){
        //         let promises = [];
        //         response.data.forEach((item,index) => {
        //             promises.push(axios.post('http://infovis.cs.ucdavis.edu/wildfire/api/firedash/wildfires/perimeter', {
        //                 state: "CA",
        //                 exact_date: item.date,
        //                 fire_id: fire_id
        //             }, config));
        //         });
        //         return Promise.all(promises);
        //     }).bind(this)).then((function(response){
        //         let parsedPerimeter = [];
        //         response.forEach((item, index) => {
        //             parsedPerimeter.push({
        //                 perimeter: item.data.perimeter['coordinates'][0][0],
        //                 perimeter_date: item.data.date,
        //                 centroid: item.data.centroid['coordinates']
        //             })
        //         })
        //         const useDataStore = useData();
        //         useDataStore.updateFireData(fire_id, [],[],[],[],parsedPerimeter,[],[]);
        //         this.isPerimeterDataReady = true;
        //         console.log('Exiting fetch perimeters')
        //     }).bind(this))

        // // this.isPerimeterDataReady = true
        // // return;
        // try{
        //     console.log('Sending post request for: ', fire_id)
        //     const data = await axios.post('http://infovis.cs.ucdavis.edu/wildfire/api/firedash/wildfires/perimeters/list', { state: state, fire_id: fire_id}, config)
        //     let parsedPerimeter = []
        //     let regex=/\(([^()]*)\)/g

        //     data.data.forEach((item, index) => {
        //         // let cur_perimeter = item.perimeter.match(regex)
        //         // let centroid = item.centroid.match(regex)
        //         // cur_perimeter = cur_perimeter.map(d=>{
        //         //     d = d.slice(1,-1).split(' ')
        //         //     d[0] = parseFloat(d[0]);
        //         //     d[1] = parseFloat(d[1]);
        //         //     return d
        //         // })
        //         // centroid = centroid[0].slice(1,-1).split(' ')
        //         // centroid[0] = parseFloat(centroid[0]);
        //         // centroid[1] = parseFloat(centroid[1]);

        //         // cur_perimeter.push(cur_perimeter[0])
        //         debugger;
        //         parsedPerimeter.push({
        //             // perimeter: cur_perimeter,
        //             perimeter: perimeterData[index],
        //             perimeter_date: item.date,
        //             centroid: item.centroid.coordinates
        //         })
        //     })
        //     parsedPerimeter = parsedPerimeter.sort((a,b) => a.perimeter_date.localeCompare(b.perimeter_date));

        //     this.perimeters = {...this.perimeters, [fire_id]: parsedPerimeter}
        //     if (data.data.length > 1){
        //         this.isPerimeterDataReady = true
        //         console.log("Perimeters Ready", data.data)
        //     } else {
        //         console.log("No perimeter found")
        //     }
        // }
        // catch(error){
        //     console.log('error :>> ', error);
        //     throw error.message
        // }
        // }
    }
})

// const state = () => ({
//     wildfires_ca: fireListData["data"]["fire"],
//     api_fetched_data: []
// })

// const getters = {
//     getWildfireByName: (state) => (name) => {
//         return state.wildfires_ca.find(wildfire => wildfire.name === name)
//     },
//     getWildfiresByYear: (state) => (year) => {
//         return state.wildfires_ca.filter( wildfire => wildfire.fire_year === year)
//     },
//     getWildfiresUntilYear: (state) => (year) => {
//         return state.wildfires_ca.filter(wildfire => wildfire.fire_year <= year)
//     },
//     getWildfiresByYearAndAcres: (state) => (year, acres) =>  {
//         let wildfires = state.wildfires_ca.filter(wildfire => wildfire.fire_year === year)
//         return wildfires.filter(wildfire => wildfire.acres <= acres)
//     },
//     getWildFiresYearRange: (state) => () => {
//         return [... new Set(state.wildfires_ca.map(wildfire => wildfire.fire_year))]
//     },
//     getWildFiresAcresRange: (state) => () => {
//         return state.wildfires_ca.map(wildfire => wildfire.acres)
//     },
//     getWildFirePerimeters: (state) => () => {
//         let perimeters = state.wildfires_ca.map(wildfire => wildfire.perimeter_count)
//         return perimeters.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0))
//     },
//     getWildfireNames: (state) => () => {
//         return state.wildfires_ca.map(wildfire => wildfire.name)
//     },
//     getWildFirePrettifyList: (state) => () => {
//         return state.wildfires_ca.map( (wildfire, index) => ({
//             name: wildfire.name,
//             year: wildfire.fire_year,
//             acres: wildfire.acres,
//             perimeters: wildfire.perimeter_count,
//             key: index
//         }))
//     }
// }

// const mutations = {
//     SAVE_FIRELIST(state, firelist){
//         state.api_fetched_data = firelist;
//     }
// }

// const actions = {
//     loadFirelist({commit}){
//         const body = {"state":"CA"}
//         Vue.axios.post("wildfires/list",body).then(result => {
//             commit('SAVE_FIRELIST',result.data);
//         }).catch(error => {
//             throw new Error(`API ${error}`)
//         })
//     }
// }

// export default {
//   namespaced: true,
//   state,
//   getters,
//   mutations,
//   actions
// }
