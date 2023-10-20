import { defineStore } from 'pinia'
import * as counties from "../../assets/data/countiesList.json"
import * as firesbycounty from "../../assets/data/heatmapdata.json"
import * as topo_ca_county from "../../assets/data/ca_counties_topo.json"
import * as topojson from "topojson"

export const useCountyfires = defineStore('countyfires', () => {
    const counties_ca = counties
    const wildfires = firesbycounty
    const counties_topo = topo_ca_county
    function getCounties() {
        return counties_ca
    }
    function getWildfires() {
        return wildfires
    }
    function getWildfiresByYear(year) {
        console.log("wildfires year in store", year)
        return wildfires.filter( wildfire => wildfire.year === year)
    }
    function getTopoBaseMap() {
        return topojson.feature(
            counties_topo,
            counties_topo.objects.subunits
        )
    }
    function getTopoCountyMap() {
        const topoData = topojson.feature(
            counties_topo,
            counties_topo.objects.subunits
        ).features
  
        return { type: "FeatureCollection", features: topoData }
    }

    return {
        getCounties,
        getWildfires,
        getWildfiresByYear,
        getTopoBaseMap,
        getTopoCountyMap
    }
})

// const state = () => ({
//   counties_ca: counties,
//   wildfires: firesbycounty,
//   counties_topo: topo_ca_county
// })

// const getters = {
//   getCounties: (state) => () => {
//     return state.counties_ca
//   },
//   getWildfires: (state) => () => {
//     return state.wildfires
//   },
//   getWildfiresByYear: (state) => (year) => {
//     return state.wildfires.filter( wildfire => wildfire.year === year);
//   },
//   getTopoBaseMap: (state) => () => {
//     return topojson.feature(
//       state.counties_topo,
//       state.counties_topo.objects.subunits
//     );
//   },
//   getTopoCountyMap: (state) => () => {
//     const topoData = topojson.feature(
//       state.counties_topo,
//       state.counties_topo.objects.subunits
//     ).features;

//     return { type: "FeatureCollection", features: topoData }
//   }

// }

// const mutations = {
// }

// export default {
//   namespaced: true,
//   state,
//   getters,
//   mutations
// }
