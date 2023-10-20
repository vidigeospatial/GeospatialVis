<template>
    <div
        id="primaryMap-container"
        class="primaryMap-container"
    >
        <div
            id="label"
            class="label-container"
        >
            <p class="labelStyle">
                {{ currentFire }}
            </p>
            <Tooltip
                direction="topRight"
                :description="description"
            />
        </div>
        <div
            id="primary-map-contents"
            v-resize="redraw"
            class="primary-map-contents"
        >
            <div
                id="primary-map-top"
                class="primary-map-top"
            >
                <Timeline
                    v-if="show"
                    class="MapTimeLine"
                    :width="timeLineWidth"
                    :height="timeLineHeight"
                    @passSelectedData="passDataToMap"
                />
            </div>
            <div
                id="primary-map-bot"
                class="primary-map-bot"
            >
                <Map
                    v-if="show"
                    class="MapInsight"
                    :width="mapWidth"
                    :height="mapHeight"
                    :perimeter-data="passData"
                    :view-ability="passViewAbility"
                    :zoom="12"
                />
            </div>
        </div>
    </div>
</template>

<script>
import * as d3 from "d3"
import Tooltip from "../editor/ui/Tooltip.vue"
import Timeline from "../editor/map/MapTimeLine.vue"
import Map from "../editor/map/Map.vue"

export default {
    name: "PrimaryMap",
    components: {
        Tooltip,
        Timeline,
        Map,
    },
    props: {
        viewAbility: {
            type: Array,
            default() {
                return [true, true]
            },
        },
    },
    data: () => ({
        currentFire: "Rim",
        description: "Detailed exploration of a fire & its properties.",
        timeLineWidth: 0,
        timeLineHeight: 0,
        mapWidth: 1,
        mapHeight: 100,
        show: false,
        zoomChart: false,
        passData: [],
        passViewAbility: [],
    }),
    computed: {},
    watch: {
        viewAbility (oldval, newval) {
            console.log("update viewAbility")
            this.passViewAbility = this.viewAbility
        },
    },
    created() {},
    mounted() {
    // Compute TimeLine and Insight size
        this.timeLineWidth = document.getElementById(
            "primaryMap-container"
        ).clientWidth
        this.timeLineHeight =
      document.getElementById("primary-map-top").clientHeight

        this.show = true
    },
    methods: {
        redraw(width, height) {
            this.timeLineWidth = document.getElementById(
                "primaryMap-container"
            ).clientWidth
        },
        ZoomOnChart() {
            // if (this.zoomChart == false) {
            //   // Compute TimeLine and Insight size
            //   this.TimeLineWidth = document.getElementById(
            //     "primaryMap-container"
            //   ).clientWidth;
            //   this.TimeLineHeight =
            //     document.getElementById("primaryMap-container").clientHeight * 0.9;
            //   console.log([this.TimeLineWidth, this.TimeLineHeight]);
            //   this.InsightWidth = document.getElementById(
            //     "primaryMap-container"
            //   ).clientWidth;
            //   this.InsightHeight =
            //     document.getElementById("primaryMap-container").clientHeight * 0;
            //   console.log([this.InsightWidth, this.InsightHeight]);
            //   this.zoomChart = true;
            //   document.getElementById("zoomChart").innerText = "Zoom Out";
            //   d3.select(".MapTimeLine").style("height", "90%");
            //   d3.select(".MapInsight").style("height", "0%");
            // } else {
            //   document.getElementById("zoomChart").innerText = "Zoom  In";
            //   // Compute TimeLine and Insight size
            //   this.TimeLineWidth = document.getElementById(
            //     "primaryMap-container"
            //   ).clientWidth;
            //   this.TimeLineHeight =
            //     document.getElementById("primaryMap-container").clientHeight * 0.3;
            //   console.log([this.TimeLineWidth, this.TimeLineHeight]);
            //   this.InsightWidth = document.getElementById(
            //     "primaryMap-container"
            //   ).clientWidth;
            //   this.InsightHeight =
            //     document.getElementById("primaryMap-container").clientHeight * 0.6;
            //   console.log([this.InsightWidth, this.InsightHeight]);
            //   this.zoomChart = false;
            //   d3.select(".MapTimeLine").style("height", "30%");
            //   d3.select(".MapInsight").style("height", "60%");
            // }
        },
        passDataToMap(data) {
            this.passData = data
        },
    },
}
</script>

<style>
.labelStyle {
  font-family: "Lato";
  color: black;
  display: flex;
  margin: 0;
  font-weight: 100;
  font-size: 0.75em;
  padding: 5px;
}

.label-container {
  position: relative;
  display: flex;
}

.iconContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}

.infoIcon {
  color: #b0b2b5;
  font-size: 0.65em;
}
</style>

<style scoped>
.primaryMap-container {
  height: 100%;
  background-color: #f8f9fa;
  box-shadow: rgb(0 0 0 / 15%) 1.95px 1.95px 2.6px;
}

.primary-map-contents {
  height: 95%;
}

.primary-map-top {
  height: 15%;
}

.primary-map-bot {
  height: 85%;
}
</style>