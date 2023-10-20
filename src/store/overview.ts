import { defineStore } from 'pinia'
import axios from "axios"

const config = { headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
} }

const API = "http://infovis.cs.ucdavis.edu/wildfire/api/firedash/"
//axios.jefaults.headers.post['Access-Control-Allow-Origin'] = '*'
//axios.defaults.headers.post['Content-Type'] = 'application/json'

export const useOverviewMap = defineStore('overviewMap',{
    state: () => ({
        overviewClusters: [],
        isClusterDataReady: false,
        error: ""
    }),
    getters: {
        getOverviewClusters(){
            return this.overviewClusters
        }
    },
    actions:{
        async fetchOverviewClusters(){
            this.isClusterDataReady = false
            try{
                const data = await axios.post('http://infovis.cs.ucdavis.edu/wildfire/api/firedash/perimeters/aggregate', { state:"CA" }, config)
                this.overviewClusters = data.data
                this.isClusterDataReady = true
                console.log("Clusters Are Ready")
            }
            catch(error){
                console.log('error :>> ', error)
                throw error.message
            }
        }
    }
})
