<template>
    <div class="test">
        <h1>Dev Page</h1>
        <!-- <LayerList :revealList="showLayerList" :layerList="layerList"/> -->
        <div
            id="considerRelative"
            :style="{width: w + 'px', height: h + 'px'}"
        >
            <Timeline />
            <resize-observer @notify="handleResize" />
        </div>
    </div>
</template>
<script>
import Timeline from "../Components/Widget/timeline/Timeline.vue"
import LayerList from "../Components/MapObject/Features/layerList.vue"

export default {
    name: "Dev",
    components: {
        LayerList,
        Timeline
    },
    data() {
        return {
            showLayerList: true,
            w: 600,
            h: 400,
            layerList: [
                {
                    image: "",
                    name: "Perimeter",
                    parameters: {
                        type: "GeoJSON",
                    },
                    id: 1,
                },
                {
                    image: "",
                    name: "Roads",
                    parameters: {
                        type: "GeoJSON",
                    },
                    id: 2,
                },
                {
                    image: "",
                    name: "Satellite",
                    parameters: {
                        type: "Heatmap",
                    },
                    id: 3,
                },
                {
                    image: "",
                    name: "Temperature",
                    parameters: {
                        type: "Heatmap",
                    },
                    id: 4,
                },
                {
                    image: "",
                    name: "Humidity",
                    parameters: {
                        type: "Heatmap",
                    },
                    id: 5,
                },
                {
                    image: "",
                    name: "Wind",
                    parameters: {
                        type: "Custom",
                    },
                    id: 6,
                },
                {
                    image: "",
                    name: "Population",
                    parameters: {
                        type: "ScatterPlot",
                    },
                    id: 7,
                },
                {
                    image: "",
                    name: "Fuel",
                    parameters: {
                        type: "BitMap",
                    },
                    id: 8,
                },
            ],
        }
    },
    methods:{
        handleResize({ width, height }){
            console.log("handling something", width, height)
            this.w = width
            this.h = height
        }
    }
}
</script>
<style lang="css" scoped>
  #considerRelative{
    position: relative;
    resize: both; 
    overflow: hidden;
  }
</style>
