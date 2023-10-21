<template>
    <div id="topo-container">
        <svg
            id="topo-svg"
            :width="width"
            :height="height"
            :selectedYear="selectedYear"
            :attribute="attribute"
        />
    </div>
</template>

<script>
import * as d3 from "d3"
import { onMounted, ref } from 'vue'
import { watch, computed } from 'vue'
import { debounce } from 'lodash'
import { useCountyfires } from "../../../../store/modules/countyfires"

export default {
    name: "CaTopoMap",
    props: {
        width: Number,
        height: Number,
        selectedYear: Number,
        attribute: String,
    },
    setup(props, context) {
        const countyfires = useCountyfires()
        const fireinfo = ref(countyfires.getWildfiresByYear(props.selectedYear)) // cafireinfo.filter((d) => d.year == this.selectedYear);
        let counties = countyfires.getTopoCountyMap()
        let basemap = countyfires.getTopoBaseMap()
        const attribute = ref(props.attribute)
        const bounds = computed(() => d3.extent(fireinfo.value, (d) => d[attribute.value]))
        const lower = computed(() => bounds.value[0])
        const upper = computed(() => bounds.value[1])
        const countyInfo = ref()
        const county = ref({
            name: "",
            acres: "",
            fires: "",
        })
        let margin = {
            top: 0,
            bottom: 100,
            left: 20,
            right: 0,
        }
        const width = ref(props.width)
        const height = ref(props.height)

        const colorScale = computed(() => d3
            .scaleSqrt()
            .range(["#ecda9a", "#ee4d5a"])
            .domain(bounds.value))

        onMounted(() => {
            init()
        })
 
        watch(() => props.selectedYear, (newval, oldval) => {
            fireinfo.value = countyfires.getWildfiresByYear(newval)
            d3.select("#topo-svg").selectAll("*").remove()
            init()
        })

        watch(() => props.attribute, (newval, oldval) => {
            attribute.value = newval
            // console.log("bounds: ", bounds.value)
            // console.log("lower bounds: ", lower.value);
            // console.log("upper bound: ", upper.value);
            // console.log("attribute change", attribute.value);
            d3.select("#topo-svg").selectAll("*").remove()
            init()
        })

        watch(() => [props.width, props.height], ([newwidth, newheight], _) => {
            width.value = newwidth
            height.value = newheight
            d3.select("#topo-svg").selectAll("*").remove()
            init()
        })

        function init() {
            const svg = d3.select("#topo-svg")
            createLegend(svg)
            drawCounties(svg)
        }

        function createLegend() {
            const svg = d3.select("#topo-svg")

            let legendScale = svg
                .append("defs")
                .append("linearGradient")
                .attr("id", "linear-gradient")
            legendScale
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "100%")

            legendScale
                .append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#ecda9a")
            legendScale
                .append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#ee4d5a")

            svg
                .append("g")
                .attr("id", "legend")
                .append("rect")
                .attr("width", width.value * 0.02)
                .attr("height", height.value * 0.25)
                .attr("transform", `translate( 0, ${height.value - margin.bottom})`)
                .style("fill", "url(#linear-gradient)")
      
            svg.append("text")
                .attr("x", 5)
                .attr("y", height.value - margin.bottom +6)
                .style("color","black")
                .style("font-size","0.5em")
                .text(d => d3.format(".2s")(lower.value))

            svg.append("text")
                .attr("x", 5)
                .attr("y", height.value - margin.bottom + (height.value * 0.25))
                .style("color","black")
                .style("font-size","0.5em")
                .text(d => d3.format(".2s")(upper.value))
        }

        function drawCounties(svg) {
            const projection = d3
                .geoMercator()
                .center([-120, 37])
                .translate([width.value / 2 - margin.left, height.value / 2])
                .scale([width.value * 5])

            const path = d3.geoPath().projection(projection)
            let tooltip = svg.append('div')
                .attr('class', 'hidden tooltip')

            svg
                .append("g")
                .attr("id", "county-info")
                .selectAll(".county")
                .data(counties.features)
                .join("path")
                .attr("fill", (d) => {
                    const countyName = d.properties.fullName
                    const countyInfo = fireinfo.value.filter((d) =>
                        d.county.includes(countyName)
                    )
                    const color = !countyInfo.length
                        ? "#dddddd"
                        : colorScale.value(countyInfo[0][attribute.value])
                    return color
                })
                .on('mouseover', function(d, i) {
                    county.value.name = i.properties.name
                    tooltip
                        .classed('hidden', false)
                        .attr('style', 'left:' + (d.pageX + 5) +
                  'px; top:' + (d.pageY + 5) + 'px')
                        .html(county.value.name)
                })
                .on("mouseout", function() {
                    // var tooltip = d3.select('.tooltip');
                    tooltip.classed('hidden', true)
                })
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 1)
                .attr("d", path)
        }

        return { 
            countyfires,
            county
        }
    },
    computed: {},
    created() {
    // this.basemap = this.$store.getters["countyfires/getTopoBaseMap"]();
    // this.counties = this.$store.getters["countyfires/getTopoCountyMap"]();
    },
}
</script>

<style scoped>
.counties {
  fill: steelblue;
  stroke: white;
  stroke-width: 1px;
}

.tooltip {
  border-bottom: 1px dotted black;
  width: auto;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 2px;
  padding: 5px 0;
  opacity: 0.9;
  position: absolute;
}

.hidden {
  display: none;
}

</style>