/* Placeholder example for creating and adding to the global state*/
import * as fireListData from  "../../assets/data/fireList_after_modify.json"

const state = () => ({
    wildfires_ca: fireListData["data"]["fire"]
})

const getters = {
    getWildfireByName: (state) => (name) => state.wildfires_ca.find(wildfire => wildfire.name === name),
    getWildfiresByYear: (state) => (year) => state.wildfires_ca.filter( wildfire => wildfire.fire_year === year),
    getWildfiresUntilYear: (state) => (year) => state.wildfires_ca.filter(wildfire => wildfire.fire_year <= year),
    getWildfireByAcresRange: (state) => (acresRange) => state.wildfires_ca
        .filter(wildfire => wildfire.acres >= acresRange[0] && wildfire.acres <= acresRange[1])
        .map( (wildfire) => ({
            name: wildfire.name,
            fire_year: wildfire.fire_year,
            acres: wildfire.acres,
            perimeter_count: wildfire.perimeter_count,
            key: wildfire.uid
        })),
    getWildfireByPerimetersRange: (state) => (perimetersRange) => state.wildfires_ca
        .filter(wildfire => 
            wildfire.perimeter_count >= perimetersRange[0] && wildfire.perimeter_count <= perimetersRange[1])
        .map( (wildfire) => ({
            name: wildfire.name,
            fire_year: wildfire.fire_year,
            acres: wildfire.acres,
            perimeter_count: wildfire.perimeter_count,
            key: wildfire.uid
        })),
    getWildfiresByYearAndAcres: (state) => (year, acres) =>  {
        let wildfires = state.wildfires_ca.filter(wildfire => wildfire.fire_year === year)
        return wildfires.filter(wildfire => wildfire.acres <= acres)
    },
    getWildFiresYearRange: (state) => () => [... new Set(state.wildfires_ca.map(wildfire => wildfire.fire_year))],
    getWildFiresAcresRange: (state) => () => state.wildfires_ca.map(wildfire => wildfire.acres),
    getWildFirePerimeters: (state) => () => {
        let perimeters = state.wildfires_ca.map(wildfire => wildfire.perimeter_count)
        return perimeters.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0))
    },
    getWildfireNames: (state) => () => state.wildfires_ca.map(wildfire => wildfire.name),
    getWildFirePrettifyList: (state) => () => state.wildfires_ca.map( (wildfire) => ({
        name: wildfire.name,
        fire_year: wildfire.fire_year,
        acres: wildfire.acres,
        perimeter_count: wildfire.perimeter_count,
        key: wildfire.uid
    }))
}

const mutations = {
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}
