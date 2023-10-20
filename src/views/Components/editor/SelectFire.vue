<template>
    <div
        id="selectFire-container"
        class="selectFire-container"
    >
        <div
            id="label"
            class="label-container"
        >
            <p class="labelStyle">
                Wildfire Selection
            </p>
            <Tooltip
                direction="topRight"
                :description="description"
            />
        </div>
        <div id="display-area">
            <FireTable
                class="table"
                :options="options"
                :map-params="mapParams"
                :template-i-d="templateID"
                :preselected="preselected"
            />
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia'
import FireTable from "./ui/FireTable.vue"
import RoundSlider from "./ui/RoundSlider.vue"
import Slider from "./ui/Slider.vue"
import Tooltip from "./ui/Tooltip.vue"
import { useWildfireList } from "@/store/selectfire"

export default {
    name: "SelectFire",
    components: {
        Tooltip,
        FireTable,
        RoundSlider,
        Slider,
    },
    props:{
        mapParams: Object,
        templateID: String,
        // Can be initialized with a selected fire already
        preselected: String
    },
    data: () => ({
        description: "Select a fire to explore.",
        selected: null,
        options: [],
        fire_list_name: [],
        selectedYear: "All Years",
        yearRange: [],
        perimeterRange: [],
        arcesRange: [],
        fireName: '',
    }),
    computed: {
        ...mapState(useWildfireList, ['getWildFirePrettifyList'])
    },
    watch: {
        selected (oldval, newval) {
            // console.log(this.selected);
        },
    },
    created() {
        this.fire_list_name = this.getWildFirePrettifyList // this.$store.getters["selectfire/getWildFirePrettifyList"]();
        this.options = this.fire_list_name
        console.log("THE OPTIONS", this.options)
    },
    mounted() {

    // this.updateOptionsAndSelected();
    },
    methods: {
        updateYearRange(range) {
            this.yearRange = range
            this.updateOptionsAndSelected('year')
        },
        updateAcreageRange(range){
            this.arcesRange = range
            this.updateOptionsAndSelected('acres')
        },
        updatePerimeterRange(range) {
            this.perimeterRange = range
            this.updateOptionsAndSelected('perimeters')
        },
        searchByFireName() {
            if (this.fireName === "") {
                console.log("empty fire name")
                this.options = this.fire_list_name
                return
            }
            this.fireName = this.fireName.replace(this.fireName[0], this.fireName[0].toUpperCase())
            let fire = this.fire_list_name.find(wildfire => wildfire.name === this.fireName)
            if (fire !== undefined) {
                this.options = [fire]
            } else {
                this.options = []
            }
            if (this.options.length == 0) {
                this.selected == ""
            } else {
                this.selected = this.options[0]
            }
            
        },
        updateOptionsAndSelected(filter) {
            console.log(this.selectedYear, this.arcesRange, this.perimeterRange)
            this.options = this.fire_list_name
            if (this.yearRange.length === 2) {
                this.options = this.options.filter(wildfire => wildfire.year >= this.yearRange[0] && wildfire.year <= this.yearRange[1])
            }
            if (this.arcesRange.length === 2) {
                this.options = this.options.filter(wildfire => wildfire.acres >= this.arcesRange[0] && wildfire.acres <= this.arcesRange[1])
            }
            if (this.perimeterRange.length === 2) {
                this.options = this.options.filter(wildfire => wildfire.perimeters >= this.perimeterRange[0] && wildfire.perimeters <= this.perimeterRange[1])
            }

            if (this.options.length === 0) {
                this.selected === ""
            } else {
                this.selected = this.options[0]
            }
        },
        // selectedOptionChange(newOption) {
        //   console.log("new option", newOption);
        //   this.selected = newOption;
        // },
        //          @selectedOptionChange="selectedOptionChange"

        resetAll() {
            this.options = this.fire_list_name
            this.$refs.child.init()
        },
        clearSearchKey() {
            // if searchkey is being cleared, options goes back to the filter state
            if (this.fireName.length === 0) {
                this.updateOptionsAndSelected()
            }
        }
    },
}
</script>

<style scoped>
.selectFire-container {
    height: 100%;
    background-color: #f8f9fa;
    box-shadow: rgb(0 0 0 / 15%) 1.95px 1.95px 2.6px;
}

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

.selectionSvgContainer {
    height: 88%;
    display: flex;
}

.align-items-center {
    display: grid;
    grid-template-columns: 30% 70%;
    gap: 10px;
    justify-items: center;
}

.col-sm-2 {
    font-family: "Lato";
    font-size: 0.75em;
    /* grid-column: 1; */
}

.col-sm {
    grid-column: 2;
}

#display-area {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    height: 94%;
    width: 100%;
}

#select-area {
    display: flex;
    flex-direction: column;
    width: 30%;
    margin-left: 5%;
}

.resetArea {
    display: flex;
    justify-content: flex-end;
}

#table-area {
    display: flex;
    width: 100%;
    margin-right: 5%;
}

</style>
