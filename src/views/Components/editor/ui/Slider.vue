<template>
    <div class="selections">
        <div class="selectionInput">
            <p>Year:&nbsp </p>
            <a-input-number 
                v-model:value="years[0]"
                :min="yearRange[0]"
                :max="yearRange[1]" 
                size="small" 
                @pressEnter="changeYear"
            />
            <p>&nbsp-&nbsp</p>
            <a-input-number 
                v-model:value="years[1]"
                :min="yearRange[0]"
                :max="yearRange[1]"
                size="small" 
                @pressEnter="changeYear"
            />
        </div>
        <a-slider
            id="selectionSlider1"
            v-model:value="years"
            range
            :min="yearRange[0]"
            :max="yearRange[1]"
            @afterChange="changeYear"
        />

        <div class="selectionInput">
            <p>Acres:&nbsp</p>
            <a-input-number 
                v-model:value="acres[0]"
                :min="arcesRange[0]"
                :max="arcesRange[1]" 
                size="small" 
                @pressEnter="changeAcres"
            />
            <p>&nbsp-&nbsp</p>
            <a-input-number
                v-model:value="acres[1]"
                :min="arcesRange[0]"
                :max="arcesRange[1]" 
                size="small" 
                @pressEnter="changeAcres"
            />
        </div>
        <a-slider
            id="selectionSlider2"
            v-model:value="acres"
            range
            :min="arcesRange[0]"
            :max="arcesRange[1]"
            @afterChange="changeAcres"
        />

        <div class="selectionInput">
            <p>Perimeter:&nbsp</p>
            <a-input-number 
                v-model:value="perimeters[0]"
                :min="perimeterRange[0]"
                :max="perimeterRange[1]" 
                size="small" 
                @pressEnter="changePerimeters"
            />
            <p>&nbsp-&nbsp</p>
            <a-input-number
                v-model:value="perimeters[1]"
                :min="perimeterRange[0]"
                :max="perimeterRange[1]" 
                size="small" 
                @pressEnter="changePerimeters"
            />
        </div>
        <a-slider
            id="selectionSlider3"
            v-model:value="perimeters"
            range
            :min="perimeterRange[0]"
            :max="perimeterRange[1]"
            @afterChange="changePerimeters"
        />
    </div>
</template>

<script>
import * as d3 from "d3"
import { mapState } from 'pinia'
import { useWildfireList } from "../../../../store/selectfire"

export default {
    name: "Slider",
    props: {},
    data: () => ({
        selectedYear: null,
        yearRange: [],
        arcesRange: [],
        perimeterRange: [],
        years: [],
        acres: [],
        perimeters: [],
    }),
    computed: {
        ...mapState(useWildfireList, ['getWildFiresYearRange']),
        ...mapState(useWildfireList, ['getWildFiresAcresRange']),
        ...mapState(useWildfireList, ['getWildFirePerimeters']),
    },
    watch: {
    
    },
    created() {},
    mounted() {
        this.init()
    },
    methods: {
        init() {
            // init Wildfire Year Slider
            let yearData = this.getWildFiresYearRange
            if (yearData[yearData.length - 1] === -1){
                yearData.pop()
            }
            this.yearRange = d3.extent(yearData)
            this.years = this.yearRange

            // init Perimeter Slider
            const perimeterData = this.getWildFirePerimeters
            this.perimeterRange = d3.extent(perimeterData)
            this.perimeters = this.perimeterRange

            // init Acreage Burned Slider;
            const acreageData = this.getWildFiresAcresRange
            this.arcesRange = d3.extent(acreageData)
            this.acres = this.arcesRange
        },
        changeYear() {
            this.$emit("updateYearRange", this.years)
        },
        changeAcres() {
            this.$emit("updateAcreageRange", this.acres)
        },
        changePerimeters() {
            this.$emit("updatePerimeterRange", this.perimeters)
        },
        selectYearRange() {

        },
        selectAcresRange() {

        },
        selectPerimeterRange() {

        },
    },
}
</script>

<style scoped>
.sliderSVG {
  width: 200px;
  height: 200px;
}

.selections {
  margin-top: 5%;
  width: 100%;
}

.selectionInput {
  display: flex;
  flex-direction: row;
}

#selectionSlider1 {
  margin-top: 0%;
  margin-bottom: 12%;
}

#selectionSlider2 {
  margin-top: 0%;
  margin-bottom: 12%;
}

#selectionSlider3 {
  margin-top: 0%;
}
</style>