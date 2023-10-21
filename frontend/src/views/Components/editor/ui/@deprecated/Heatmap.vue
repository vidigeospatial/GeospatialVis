<template>
    <svg
        id="heatmap-svg"
        class="heatmapSVG"
        :selectedYear="selectedYear"
        :width="width"
        :height="height"
        :attribute="attribute"
    />
</template>

<script>
import * as d3 from "d3"
import { counter } from '@fortawesome/fontawesome-svg-core'
import { onMounted, ref, watch } from "vue"
import { useCountyfires } from "../../../../store/modules/countyfires"

export default {
    name: "HeatMap",
    props: {
        selectedYear: Number,
        width: Number,
        height: Number,
        attribute: String, // total_fires, total_acreage
    },
    setup(props, context) {
        const countyfires = useCountyfires()
        // created
        let heatmapdata = countyfires.getWildfires()
        let counties = countyfires.getCounties()
        const attribute = ref(props.attribute)
        let margin = {
            left: 60,
            right: 30,
            top: 20,
            bottom: 15,
        }

        const width = ref(props.width)
        const height = ref(props.height)

        watch((props), val => {
            d3.select("#heatmap-svg").selectAll("*").remove()
            attribute.value = val.attribute
            width.value = val.width
            height.value = val.height
            init()
        })
    
        function range(start, end) {
            return Array(end - start + 1)
                .fill()
                .map((_, idx) => start + idx)
        }

        onMounted(() => {
            init()
        })

        function init() {
            let clicked = false
            const svg = d3.select("#heatmap-svg")
            const years = range(2000, 2020)
            const x = d3
                .scaleBand()
                .range([0, width.value - margin.left - margin.right])
                .domain(years)
                .padding(0.01)

            svg
                .append("g")
                .attr("class", "axisStyle")
                .attr(
                    "transform",
                    `translate( ${margin.left}, ${height.value - margin.bottom})`
                )
                .call(d3.axisBottom(x))

            const y = d3
                .scaleBand()
                .range([height.value - margin.top, 0])
                .domain(counties)
                .padding(0.01)
            svg
                .append("g")
                .attr("class", "axisStyle")
                .attr(
                    "transform",
                    `translate( ${margin.left}, ${
                        margin.top - margin.bottom
                    })`
                )
                .call(d3.axisLeft(y).tickFormat(x => x.replace(' County', '')))
      
            const myColor = d3
                .scaleSqrt()
            // .scaleLog().base(8)
                .range(["#ecda9a", "#ee4d5a"])
                .domain(d3.extent(heatmapdata, d => attribute.value === "total_acreage" ? d.total_acreage : d.total_fires))

            // console.log("height debug!!!!!!!!!!!!!!!!!!!!!!")
            // console.log(y.bandwidth())
            // console.log(y.range()[0])
            // console.log(height.value)

            svg
                .append("g")
                .attr(
                    "transform",
                    `translate( ${margin.left}, ${margin.top - margin.bottom})`
                )
                .selectAll("rect")
                .data(heatmapdata)
                .join("rect")
                .attr("x", function (d) {
                    return x(d.year)
                })
                .attr("y", function (d) {
                    return y(d.county)
                })
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", function (d) {
                    if (attribute.value === "total_acreage") {
                        return myColor(d.total_acreage)
                    } 
                    return myColor(d.total_fires)
          
                })
                .on("click", function(d, i){
                    clicked = true
                    context.emit('selectYearChange', i.year)
                    svg.select(".highlight").remove()
                    highLightRec(i.year)
                })

            const highLightRec = (year) => {
                svg
                    .append("rect")
                    .classed("highlight", true)
                    .attr(
                        "transform",
                        `translate( ${margin.left}, ${margin.top - margin.bottom})`
                    )
                    .attr("x", function (d) {
                        return x(year)
                    })
                    .attr("y", function (d) {
                        return y.range()[1]
                    })
                    .attr("width", x.bandwidth())
                    .attr("height", y.range()[0])
                    .style("fill", "transparent")
                    .attr("stroke", "black")
                    .style("opacity", 0.6)
                    .style("stroke-width", "2px")
            }

            if (clicked === false) {
                highLightRec(props.selectedYear)
            }
        }

        return { 
            countyfires,
            heatmapdata,
            counties,
        }
    },
}
</script>

<style>
.axisStyle text {
  color: black;
  font-size: 0.5em;
}

.axisStyle line {
  color: black;
}

.axisStyle path {
  color: black;
}
</style>

<style scoped>
.heatmapSVG {
  float: left;
}
</style>