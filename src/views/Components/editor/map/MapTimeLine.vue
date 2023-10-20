<template>
    <div
        id="timeline"
        class="timelineWrapper"
    >
        <svg
            id="Timeline"
            :width="width"
            :height="height"
        />
    </div>
</template>

<script>
import * as d3 from "d3"

import perimData from "../../../../assets/data/test_perimeter.json"
import powerData from "../../../../assets/data/test_power.json"
import Perimeter from "../../Views/components/timeline/perimeter"

export default {
    name: "Timeline",
    components: {},
    props: {
        width: Number,
        height: Number,
    },
    data: () => ({
        selected: [],
        firePerims: [],
        margin: {
            top: 10,
            bottom: 30,
            left: 30,
            right: 10,
        },
        xAxis: null,
        yAxis: null,
        brush: null,
    }),
    computed: {},
    watch: {
        width () {
            d3.select("#Timeline").selectAll("*").remove()
            this.init()
        },
        selected(){
            this.$emit("passSelectedData", this.selected)
        }
    },
    created() {
        this.process_data()
    },
    mounted() {
        this.init()
    },
    methods: {
        process_data() {
            // Collect Data
            // stores all temporally different perimeters of a singular fire

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

                this.firePerims.push(perim)
            }
            this.firePerims.sort((a, b) => (a.date > b.date ? 1 : -1))
            for (let each of this.firePerims) {
                each.date = each.date.toLocaleString()
            }
        },
        init() {
            // Build SVG
            const dates = d3.map(this.firePerims, (d) => d.date)

            this.xAxis = d3
                .scaleTime()
                .domain([new Date(dates[0]), new Date(dates[dates.length - 1])])
                .range([this.margin.left, this.width - this.margin.right])

            this.yAxis = d3
                .scaleLinear()
                .domain([0, d3.max(d3.map(this.firePerims, (d) => d.acres))])
                .nice()
                .range([this.height - this.margin.bottom, this.margin.top])

            // create a tooltip
            const Tooltip = d3
                .select("#timelineWrapper")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")

            const svg = d3
                .select("#Timeline")
                .attr("viewBox", [0, 0, this.width, this.height])

            this.brush = d3
                .brushX()
                .extent([
                    [this.margin.left, this.margin.top],
                    [this.width - this.margin.right, this.height - this.margin.bottom],
                ])
                .on("end", this.update)
            svg.append("g").attr("class", "brush").call(this.brush)

            this.timelineAxis(svg)
            // this.timelinePerimeters(svg);
            this.timeLineAverages(svg)
        },
        timelinePerimeters(svg) {
            const x = this.xAxis
            const y = this.yAxis

            svg
                .append("g")
                .attr("class", "bars")
                .selectAll("rect")
                .data(this.firePerims)
                .join("rect")
                .attr("x", (d) => x(d.date))
                .attr("y", (d) => y(d.acres))
                .attr("height", (d) => y(0) - y(d.acres))
                .attr("width", x.bandwidth())
                .attr("fill", "#7ED26D")
                .append("title")
                .text(function (d) {
                    return "Date:  " + d.date + "\nArces: " + d.acres
                })
        },
        timeLineAverages(svg) {
            const x = this.xAxis
            const y = this.yAxis
            let that = this
            svg
                .append("g")
                .attr("id", "perimeterPoints")
                .attr("class", "scatter")
                .selectAll("circle")
                .data(this.firePerims)
                .join("circle")
                .attr("cx", (i) => x(new Date(i.date)))
                .attr("cy", (i) => y(i.acres))
                .attr("r", 2)
                .on("mouseover", function (e,d) {
                    if(that.selected.includes(d)){
                        return
                    }
                    d3.select(this).transition().attr("fill", "red")
                })
                .on("mouseout", function (e,d) {
                    if(that.selected.includes(d)){
                        return
                    }
                    d3.select(this).transition().attr("fill", "black")
                })
                .on("click", function (e,d) {
                    if(that.selected.includes(d)){
                        let index = that.selected.indexOf(d)
                        that.selected.splice(index,1)
                        d3.select(this).transition().attr("fill", "black")
                    }else{
                        that.selected.push(d)
                        d3.select(this).transition().attr("fill", "orange")
                    }
                })
                .attr("fill", "black")
                .append("title")
                .text(function (d) {
                    return (
                        "Date:      " +
            d.date +
            "\nAcres Burned: " +
            d3.format(".2s")(d.acres)
                    )
                })

            const dates = d3.map(this.firePerims, (d) => d.date)

            svg.on("dblclick", function () {
                x.domain([new Date(dates[0]), new Date(dates[dates.length - 1])])
                d3.select("#TLxAxis").transition().call(d3.axisBottom(x))
                svg
                    .selectAll("circle")
                    .transition()
                    .duration(1000)
                    .attr("fill", (i) => {
                        if(that.selected.includes(i)){
                            return "orange"
                        }
                        return "black"
                    })
                    .attr("cx", (i) => x(new Date(i.date)))
                    .attr("cy", (i) => y(i.acres))
                    .attr("r", 2)
            })
        },
        timelineAxis(svg) {
            const x = this.xAxis
            const y = this.yAxis

            svg
                .append("g")
                .attr("id", "TLxAxis")
                .attr("class", "axisStyle")
                .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
                .call(d3.axisBottom(x).ticks(8))

            svg
                .append("g")
                .attr("id", "TlyAxis")
                .attr("class", "axisStyle")
                .attr("transform", `translate(${this.margin.left},0)`)
                .call(
                    d3
                        .axisLeft(y)
                        .tickFormat((d) => d3.format(".2s")(d))
                        .ticks(3)
                )
        },
        update(event, d) {
            const x = this.xAxis
            const y = this.yAxis
            const svg = d3.select("#Timeline")
            const { brush } = this

            let extent = event.selection
            if (extent) {
                x.domain([x.invert(extent[0]), x.invert(extent[1])])
                svg.select(".brush").call(brush.move, null)
            }

            d3.select("#TLxAxis").transition().duration(1000).call(d3.axisBottom(x))
            svg
                .selectAll("circle")
                .transition()
                .duration(1000)
                .attr("cx", (i) => x(new Date(i.date)))
                .attr("cy", (i) => y(i.acres))
                .attr("r", 4)
        },
    },
}
</script>

<style>
.axisStyle text {
  color: black;
  /* font-size: 0.5em; */
}

.axisStyle line {
  color: black;
}

.axisStyle path {
  color: black;
}
</style>

<style>
div.tooltip {
  position: absolute;
  text-align: center;
  width: 60px;
  height: 28px;
  padding: 2px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}
</style>
