<template>
    <div
        id="timeline"
        class="timelineWrapper"
    >
        <TimelineDetailView 
            v-if="DemoViewData"
            :dataset="DemoViewData" 
            :width="detailViewContainerWidth"
            :height="height"
        />

        <PerimeterTimeline
            :perimeter-sample="perimMeshes"
            :global-scale="globalScale"
            :width="sliceContainerWidth"
            :height="height"
            :clear="clear"
            @selectedObj="ProcessSelectedObj"
        />
    </div>
</template>

<script>
import * as d3 from "d3"
import PerimeterTimeline from "./PerimeterTimeline.vue"
import TimelineDetailView from "./TimelineDetailView.vue"

import perimData from "../../../../../assets/data/test_perimeter.json"
import powerData from "../../../../../assets/data/test_power.json"

import Perimeter from "./perimeter.js"

export default {
    name: "Timeline",
    components: {
        PerimeterTimeline,
        TimelineDetailView,
    },
    props: {
        width: Number,
        height: Number,
        clear: Boolean
    },
    data(){
        return{
            DemoViewData: []
        }
    },
    computed: {
        configs() {
            return perimData.data.fire_perimeter
        },
        perimMeshes() {
            // stores all temporally different perimeters of a singular fire
            let firePerims = []

            let perimEntries = perimData.data.fire_perimeter
            let powerEntries =
        powerData.data.fire_avg_pow_and_conf_per_coord_per_hour

            for (let perimEntry of perimEntries) {
                var perim = new Perimeter(perimEntry)

                let perimPowerData = powerEntries.filter((powerEntry) => {
                    let powerDate = new Date(powerEntry.date_trunc)
                    let diffTime = perim.date - powerDate
                    let diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

                    return diffHours <= 6 && diffHours >= 0
                })

                perim.powerData = perimPowerData

                perim.init()
                firePerims.push(perim)
            }

            let mapOfSimilarFirePerims = this.omitSimilarParams(firePerims)
            return [mapOfSimilarFirePerims[0], mapOfSimilarFirePerims[1], mapOfSimilarFirePerims[2]]
        },
        // calculate the global scale, so that the biggest perimeter is then 1
        globalScale() {
            let globalMax = this.findGlobalMax(perimData.data.fire_perimeter)
            return 1 / globalMax
        },
        sliceContainerWidth(){ return 30},
        detailViewContainerWidth(){ return 70}
    },
    mounted() {
    },
    methods: {
        ProcessSelectedObj(data){
            this.DemoViewData = data.sort(function(a, b) {
                return a - b
            })
            this.$emit("selection", this.DemoViewData)
        },
        // exludes similar parameters (currently if change in acres is small)
        omitSimilarParams(firePerims) {
            let initalIndex = 0
            let similarToInitial = []
            let spliceList = []
            let mapOfSimilarFirePerims = new Map()
            for (let index = 1; index < firePerims.length; index++) {
                let element = firePerims[index]
                let prevElem = firePerims[index - 1]

                let hourDif =
          (element.date.getTime() - prevElem.date.getTime()) / 1000 / 60 / 60
                let acreDif =
          (Math.abs(prevElem.acres - element.acres) / prevElem.acres) * 100

                // if acre difference was < 10%
                if (acreDif < 30) {
                    // if hour difference was < 10
                    if (hourDif < 30) {
                        similarToInitial.push(element)
                        spliceList.push(element)
                        continue
                    }
                }
                if (similarToInitial.length > 0) {
                    similarToInitial.push(firePerims[initalIndex])
                    let middlePerims = similarToInitial[parseInt(similarToInitial.length/2)]
                    similarToInitial.splice(similarToInitial.indexOf(middlePerims), 1)
                    spliceList.push(firePerims[initalIndex])
                    spliceList.splice(spliceList.indexOf(middlePerims),1)
                    mapOfSimilarFirePerims.set(middlePerims, [...similarToInitial])
                }
                initalIndex = index
                similarToInitial = new Array()
            }
     
            let NewList = d3.filter(firePerims, (d) => {
                if (!spliceList.includes(d)) return d
            })
            return [[...NewList], new Map(mapOfSimilarFirePerims), [...firePerims]]
        },
        findGlobalMin(perimEntries) {
            let globalMin = Number.MAX_VALUE

            for (let perimEntry of perimEntries) {
                let polygons = perimEntry.perimeter.coordinates
                let centroid = perimEntry.centroid.coordinates
                for (let polygon of polygons) {
                    let min = d3.min(polygon, (d) => d3.min(d, (e) => e[0] - centroid[0]))
                    if (min < globalMin) globalMin = min
                }
            }
            return globalMin
        },
        findGlobalMax(perimEntries) {
            let globalMax = Number.MIN_VALUE

            for (let perimEntry of perimEntries) {
                let polygons = perimEntry.perimeter.coordinates
                let centroid = perimEntry.centroid.coordinates
                for (let polygon of polygons) {
                    let max = d3.max(polygon, (d) => d3.max(d, (e) => e[0] - centroid[0]))
                    if (max > globalMax) globalMax = max
                }
            }
            return globalMax
        },
        findRanges(perimEntries) {
            let globalMaxY = -Number.MAX_VALUE
            let globalMinY = Number.MAX_VALUE
            let globalMaxX = -Number.MAX_VALUE
            let globalMinX = Number.MAX_VALUE

            for (let perimEntry of perimEntries) {
                let polygons = perimEntry.perimeter.coordinates
                let centroid = perimEntry.centroid.coordinates
                for (let polygon of polygons) {
                    let maxY = d3.max(polygon, (d) => d3.max(d, (e) => 
                        e[0] // - centroid[0]
                    ))

                    let minY = d3.min(polygon, (d) => d3.min(d, (e) => e[0]))

                    let maxX = d3.max(polygon, (d) => d3.max(d, (e) => e[1]))

                    let minX = d3.min(polygon, (d) => d3.min(d, (e) => e[1]))

                    if (minY < globalMinY) globalMinY = minY
                    if (maxY > globalMaxY) globalMaxY = maxY
                    if (minX < globalMinX) globalMinX = minX
                    if (maxX > globalMaxX) globalMaxX = maxX
                }
            }
            return [globalMinY, globalMaxY, globalMinX, globalMaxX]
        },
    },
}
</script>

<style scoped>
/* #timeline{
  margin: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
} */
/* #TimelineDisplay{
  display: inline-block;
} */

.timelineWrapper{
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
}

</style>