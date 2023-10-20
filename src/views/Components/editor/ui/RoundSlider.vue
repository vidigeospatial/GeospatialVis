<template>
    <svg
        id="slider-svg"
        class="sliderSVG"
    />
</template>

<script>
import * as d3 from "d3"

export default {
    name: "RoundSlider",
    props: {},
    data: () => ({
        selectedYear: null,
        optionsYear: [],
        numOfFireRange: [],
        arcesRange: [],
        margin: {
            left: 30,
            right: 30,
            top: 20,
            bottom: 15,
        },
    }),
    computed: {},
    watch: {
        selected (oldval, newval) {
            console.log(this.selected)
        },
        numOfFireRange (oldval, newval) {
            this.onChange()
        },
        arcesRange (oldval, newval) {
            this.onChange()
        },
    },
    created() {
        console.log(
            "fire names",
            this.$store.getters["selectfire/getWildFirePrettifyList"]()
        )
    },
    mounted() {
        this.init()
        this.draw()
    },
    methods: {
        init() {
            this.drawBackGroundBar()

            this.initWildfireYearSlider()
            this.initPerimeterSlider()
            this.initAcreageBurnedSlider()
        },
        drawBackGroundBar() {
            const arc = this.initArc()

            d3.select("#slider-svg")
                .append("g")
                .attr("transform", "translate(80, 10)")
                .append("path")
                .attr("class", "arc")
                .attr("d", arc)
                .attr("fill", "green")
        },
        initArc() {
            return d3.arc()
                .innerRadius(102)
                .outerRadius(98)
                .startAngle(0)
                .endAngle(180)
                .cornerRadius(10)
        },
        initDrag() {
            let dragMin = d3
                .drag()
                .on("start", dragMinStarted)
                .on("dragged", minDragged)
                .on("end", dragMinEnded)
            let dragMax = d3
                .drag()
                .on("start", dragMaxStarted)
                .on("dragged", maxDragged)
                .on("end", dragMaxEnded)
        },
        dragMinStarted(d,i,e) {
            sourceEvent.stopPropagation()
            d3.select(this).classed("dragging", true)
        },
        minDragged(d,i,e) {
            d_from_origin = Math.sqrt(
                Math.pow(e.x, 2) + Math.pow(e.y, 2)
            )
        },
        initWildfireYearSlider() {
            const yearData =
        this.$store.getters["selectfire/getWildFiresYearRange"]()
            console.log("YEAR DATA", yearData)
            this.optionsYear = ["All Years"].concat(yearData)
            this.selectedYear = this.optionsYear[0]

            const arcInfo = [90, 85, 0, 180]
            // this.initArc(arcInfo);
        },
        initPerimeterSlider() {
            const perimeterData =
        this.$store.getters["selectfire/getWildFirePerimeters"]()
            console.log("Perimeter", d3.extent(perimeterData))

            const arcInfo = [90, 85, 0, 180]
            // this.initArc(arcInfo);
        },
        initAcreageBurnedSlider() {
            const acreageData =
        this.$store.getters["selectfire/getWildFiresAcresRange"]()
            console.log("Acreage", d3.format(".2s")(d3.extent(acreageData)[1]))

            const arcInfo = [90, 85, 0, 180]
            // this.initArc(arcInfo);
        },
        draw() {},
    },
}
</script>

<style scoped>
.sliderSVG {
  width: 200px;
  height: 200px;
}
</style>
