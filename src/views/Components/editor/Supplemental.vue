<template>
    <div
        id="supplemental-container"
        class="supplemental-container"
    >
        <div
            id="label"
            class="label-container"
        >
            <p class="labelStyle">
                {{ supplementalViewName }}
            </p>
            <Tooltip
                direction="topRight"
                :description="description"
            />
            <a-dropdown
                :trigger="['click']"
                size="small"
                class="s-down-style"
            >
                <a @click.prevent>
                    CA Counties Analysis
                    <DownOutlined />
                </a>
                <template #overlay>
                    <a-menu>
                        <a-menu-item
                            key="county"
                            @click="changeView('CA Counties Analysis')"
                        >
                            CA Counties Analysis
                        </a-menu-item>
                        <a-menu-item
                            key="seasonality"
                            @click="changeView('Fire Seasonality')"
                        >
                            Fire Seasonality
                        </a-menu-item>
                        <a-menu-item
                            key="pattern"
                            @click="changeView('Ignition Patterns')"
                        >
                            Ignition Patterns
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </div>
        <div
            id="selection-svg-container"
            class="selectionSvgContainer"
        > 
            <HeatMap
                v-if="show"
                :width="heatWidth"
                :height="heatHeight"
                :selected-year="selectedYear"
                :attribute="attribute"
                @selectYearChange="selectYearChange"
            />
            <CaTopoMap
                v-if="show"
                :width="topoWidth"
                :height="topoHeight"
                :selected-year="selectedYear"
                :attribute="attribute"
            />
        </div>
        <p
            id="bottom-container"
            class=""
        >
            Total 
            <a-select
                ref="select"
                v-model:value="attribute"
                style="width: 120px"
                :options="attributeOptions"
                size="small"
                @change="test"
            />
            Burned for {{ selectedYear }}
        </p>
    </div>
</template>

<script>
import { DownOutlined } from '@ant-design/icons-vue'
import { onMounted } from 'vue'
import { ref } from 'vue'
import { debounce } from 'lodash'
import CaTopoMap from "./ui/CaCounties.vue"
import HeatMap from "./ui/Heatmap.vue"
import Tooltip from "./ui/Tooltip.vue"

export default {
    name: "Supplemental",
    components: {
        Tooltip,
        HeatMap,
        CaTopoMap,
        DownOutlined
    },
    setup(props, context) {
        const description = "Select a fire to explore."
        const supplementalViewName = "CA Counties Analysis"
        const selectedYear = ref(2008)
        const show = ref(false)
        const heatWidth = ref(0)
        const heatHeight = ref(0)
        const topoWidth = ref(0)
        const topoHeight = ref(0)
        const attributeOptions = ref([
            {
                value: "total_fires",
                label: "Fires"
            },
            {
                value: "total_acreage",
                label: "Acreages"
            }
        ])
        const attribute = ref("total_acreage")

        window.addEventListener("resize", debounce(computeSvgDims, 500))

        onMounted(() => {
            init()
        })

        function init() {
            computeSvgDims()
            show.value = true
        }

        function setDimensions() {
            computeSvgDims()
        }

        function changeView(name){
            supplementalViewName = name
        }

        function computeSvgDims() {
            // TODO: When the resize is called the new scaled height computation is not correct, need to compute the proper scalar.
            const container = document.getElementById("selection-svg-container")
            // console.log("container info: ", container)
            heatWidth.value = container.offsetWidth * 0.7
            heatHeight.value = container.offsetHeight
            topoWidth.value = container.offsetWidth * 0.3
            topoHeight.value = container.offsetHeight
            // console.log("height change, ", topoHeight.value)
        }

        function selectYearChange(year) {
            selectedYear.value = year
        }

        function test() {
            // console.log("attribute value, ", attribute.value)
        }

        return {
            description,
            supplementalViewName,
            show,
            heatWidth,
            heatHeight,
            topoWidth,
            topoHeight,
            selectedYear,
            attributeOptions,
            attribute,
            test,
            setDimensions,
            changeView,
            selectYearChange,
        }
    },
    computed: {},
    watch: {},
    created() {},
}
</script>

<style scoped>
.supplemental-container {
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
  height: 85%;
  display: flex;
}

.supp-btn-txt {
  
  font-weight: 100;
  font-size: 0.75em;
}

.bottom-container {
  height: 10%;
  display: flex;
}

.s-down-style{
    font-size: 11px;
    margin: 4px;
    font-family: "Lato";
}

</style>