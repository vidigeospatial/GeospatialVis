<template>
    <div class="deck-container">
        <div
            id="map"
            ref="map"
        />
        <canvas
            id="deck-canvas"
            ref="canvas"
        />
    </div>
</template>
<script>
import { Deck } from "@deck.gl/core"
import { IconLayer } from "@deck.gl/layers"
import mapboxgl from "mapbox-gl"
import { bus } from '../../../../index'
import perimData from "../../../../assets/data/test_perimeter.json"
import satelData from "../../../../assets/data/export_public_fire_radiative_power_2021_12_03_15_51_10_764.json"
import { Generate } from "./importMap"
import { GenerateSatel } from "./importSatellite"

export default {
    name: "GeoMap",
    props: {
        resizeMap: {
            type: Boolean,
            default: false
        },
        mapObjectID:{
            type: String,
            default: ""
        },
        linkedViewState: {
            type: Object,
        }
    },
    data() {
        return {
            viewState: {
                latitude: 38.544907,
                longitude: -121.740517,
                zoom: 12,
                pitch: 0,
                bearing: 0,
            },
            accessToken: this.$store.state.config.mapboxKey,
            PerimeterAppear: [this.mapObjectID, true],
            SatelAppear: [this.mapObjectID, true],
            ChoosenPerimeter: [],
            ChoosenSatel: [] 
        }
    },
    watch: {
        resizeMap (newVal, oldVal) {
            // watch it
            this.map.resize()
        },
        linkedViewState(newVal, oldVal){
            if (this.linkedViewState != null){
                this.updateLinkedView(this.linkedViewState)
            }
        },
        PerimeterAppear(newVal, oldVal){
            if(this.PerimeterAppear[0] == this.mapObjectID){
                console.log(this.ChoosenPerimeter)
                // Load permeter data and load satellite data
                let newPerimProp; let newSatelProp
                if(this.PerimeterAppear[1]){
                    newPerimProp = Generate(this.ChoosenPerimeter)
                    if (this.SatelAppear[1]){
                        newSatelProp = GenerateSatel(this.ChoosenSatel)
                        this.deck.setProps({ layers: newPerimProp.concat(newSatelProp) })
                    }else{
                        this.deck.setProps({ layers: newPerimProp })
                    }
                    console.log(newSatelProp)
                }else{
                    console.log(this.ChoosenSatel)
                    console.log(this.SatelAppear[1])
                    if (this.SatelAppear[1]) {
                        this.deck.setProps({ layers: GenerateSatel(this.ChoosenSatel) })
                    }else{
                        this.deck.setProps({ layers: [] })
                    }
                } 
            }
        },
        SatelAppear(newVal, oldVal){
            if(this.SatelAppear[0] == this.mapObjectID){
                // Load permeter data and load satellite data
                let newPerimProp; let newSatelProp
                if(this.SatelAppear[1]){
                    if (this.PerimeterAppear[1]) {
                        newPerimProp = Generate(this.ChoosenPerimeter)
                        newSatelProp = GenerateSatel(this.ChoosenSatel)
                        this.deck.setProps({ layers: newPerimProp.concat(newSatelProp) })
                    }else{
                        newSatelProp = GenerateSatel(this.ChoosenSatel)
                        this.deck.setProps({ layers: newSatelProp })
                    }
                    console.log(newSatelProp)
                }else if (this.PerimeterAppear[1]) {
                    newPerimProp = Generate(this.ChoosenPerimeter)
                    this.deck.setProps({ layers:newPerimProp })
                }else{
                    this.deck.setProps({ layers: [] })
                } 
            }
        },
        ChoosenPerimeter(newVal, oldVal){
            if(this.PerimeterAppear[0] == this.mapObjectID){
                if(this.PerimeterAppear[1]){
                    this.ChoosenSatel = []
                    for(let i = 0; i < this.ChoosenPerimeter.length; i++){
                        if (this.ChoosenPerimeter[i].perimeter_date == undefined){
                            continue
                        }else{
                            this.ChoosenSatel.push(satelData[this.cloestSatelData(this.ChoosenPerimeter[i].perimeter_date)])
                        }
                    }
                    console.log(this.ChoosenSatel)
                    let newPerimProp = Generate(this.ChoosenPerimeter)
                    let newSatelProp = GenerateSatel(this.ChoosenSatel)
                    this.deck.setProps({ layers: newPerimProp.concat(newSatelProp) })
                }
            }
        }
    },
    created() {
        this.map = null
        this.deck = null
    },
    mounted() {
        this.busListener()
        // parse perimeter
        let perimEntries = perimData.data.fire_perimeter

        // creating the map
        this.map = new mapboxgl.Map({
            accessToken: this.accessToken,
            container: this.$refs.map,
            interactive: true,
            style:
        this.mapStyle || "mapbox://styles/haxzie/ck0aryyna2lwq1crp7fwpm5vz",
            center: [this.viewState.longitude, this.viewState.latitude],
            zoom: this.viewState.zoom,
            pitch: this.viewState.pitch,
            bearing: this.viewState.bearing,
        })

        console.log(satelData)
        // Filter Satel Data
        for (let i = 0; i < satelData.length; i++){
            if (satelData[i].date == undefined){
                console.log(satelData[i])
            }
        }

        // creating the deck.gl instance
        this.deck = new Deck({
            canvas: this.$refs.canvas,
            width: "100%",
            height: "100%",
            initialViewState: this.viewState,
            controller: true,
            // change the map's viewstate whenever the view state of deck.gl changes
            onViewStateChange: ({ viewState }) => {
                // When this changes... update a linked map to have the same state?
                this.updateMapViewState(viewState)
                console.log(this.mapObjectID, ": change map view in here ", viewState)
                console.log(viewState.latitude, viewState.longitude)
                bus.$emit("newViewPosition", [this.mapObjectID, viewState, []])
            },
            layers: [Generate(this.ChoosenPerimeter), GenerateSatel([])]
        })
        console.log(this.deck.layers)
        console.log(perimEntries[80])
        console.log(satelData[this.cloestSatelData(perimEntries[80].perimeter_date)])
    },
    methods: {
        updateLinkedView(properties) {
            console.log(properties)
            /* When a status update is made for this object (e.g a viewport link and it is NOT the controller, fix its viewport to the controller and disable controlling options)
           If link is removed toggle option back on
        */
            this.updateMapViewState(properties)
            this.deck.setProps({
                initialViewState: {
                    longitude: properties.longitude,
                    latitude: properties.latitude,
                    zoom: properties.zoom,
                },
            })
        },
        busListener() {
            bus.$on("PerimeterStatus", (status) => {
                if(status[0] == this.mapObjectID){
                    this.PerimeterAppear = status
                }
            })
            bus.$on("SatelStatus", (status) => {
                if(status[0] == this.mapObjectID){
                    this.SatelAppear = status
                }
            })
            bus.$on("ChoosenPerimeter", (arr) => {
                if(arr[0] == this.mapObjectID){
                    this.ChoosenPerimeter = arr
                    this.ChoosenSatel = []
                    for(let i = 0; i < this.ChoosenPerimeter.length; i++){
                        this.ChoosenSatel.push(satelData[this.cloestSatelData(this.ChoosenPerimeter[i].perimeter_date)])
                    }
                }
            })

            bus.$on("MapObjectSelectedData", (arr) => {
                if(arr[0].includes(this.mapObjectID)){
                    let renderData = arr[1]
                    let tempArr = []
                    let perimEntries = perimData.data.fire_perimeter
                    for(let i = 0; i < renderData.length; i++){
                        tempArr.push(perimEntries[renderData[i]])
                    }
                    this.ChoosenPerimeter = [...tempArr]
                }
            })
        },
        drawFireList(properties) {
            /* If there is no layer call this function to initalize the fire list */
            const layer = new IconLayer({
                id: "firelist-icon-layer",
                data: properties.data,
                pickable: true,
                // iconAtlas and iconMapping are required
                // getIcon: return a string
                iconAtlas:
          "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
                iconMapping: ICON_MAPPING,
                getIcon: (d) => "marker",
                sizeScale: 15,
                getPosition: (d) => d.centroid.coordinates,
                getSize: (d) => 5,
                getColor: (d) => [Math.sqrt(d.acres), 140, 0],
            })

            this.map.on("load", () => {
                this.map.addLayer(layer)
            })
        },
        toggleFireListLayer() {},
        updateMapViewState(viewState) {
            this.map.jumpTo({
                center: [viewState.longitude, viewState.latitude],
                zoom: viewState.zoom,
                bearing: viewState.bearing,
                pitch: viewState.pitch,
            })
        },
        cloestSatelData(compareTime){
            let mark_time = 9999999
            let mark_index = -1
            for (let i = 0; i < satelData.length; i++) {
                if (mark_time > Math.abs(new Date(compareTime) - new Date(satelData[i].date)) || mark_index == -1){
                    mark_time = Math.abs(new Date(compareTime) - new Date(satelData[i].date))
                    mark_index = i
                }
            }
            console.log(mark_index)
            return mark_index
        },
    },
}
</script>
<style lang="css" scoped>
@import "~mapbox-gl/dist/mapbox-gl.css";

p {
  color: black;
}

.deck-container {
  width: 100%;
  height: 100%;
  position: relative;
}
#map {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #e5e9ec;
  overflow: hidden;
}
#deck-canvas {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 95%;
}

#deckgl-overlay {
  left: 0;
}
</style>
