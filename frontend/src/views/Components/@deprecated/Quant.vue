<template>
    <div
        id="quant-container"
        class="quant-container"
    >
        <div
            id="label"
            class="label-container"
        >
            <p class="labelStyle">
                Analysis
            </p>
            <Tooltip
                direction="topRight"
                :description="description"
            />
        </div>
        <br>
        <a-row>
            <a-col :span="14">
                <a-card title="Perimeters">
                    <p>{{ selectedFire ? selectedFire.perimeters : "N/A" }}</p>
                </a-card>
            </a-col>
            <a-col :span="10">
                <a-card title="name">
                    <p>{{ selectedFire ? selectedFire.name : "N/A" }}</p>
                </a-card>
            </a-col>
        </a-row>
        <br>
        <a-row>
            <a-col :span="14">
                <a-card title="Acres">
                    <p>{{ selectedFire ? selectedFire.acres : "N/A" }}</p>
                </a-card>
            </a-col>
            <a-col :span="10">
                <a-card title="year">
                    <p>{{ selectedFire ? selectedFire.year : "N/A" }}</p>
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue'
import Tooltip from "../editor/ui/Tooltip.vue"
import { useWildfireList } from "../../../store/selectfire"

export default {
    name: "Quant",
    components:{
        Tooltip
    },
    props: {},
    setup(props, context) {
        const description = "Analytic information about the current fire."
        const wildfireList = useWildfireList()
        const selectedFire = ref()

        wildfireList.$subscribe((mutation, state) => {
            console.log(state.fire)
            selectedFire.value = state.fire
            console.log("selected fire change success!!")
        })

        return {
            description,
            selectedFire
        }
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    methods: {},
}
</script>

<style scoped>
.quant-container {
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

.info-container {
  width: 100%;
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