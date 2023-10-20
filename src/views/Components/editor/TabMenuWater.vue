<template>
    <div class="h-full flex flex-col">
        <TabMenu
            :model="items"
            class="h-auto"
            @tab-change="onTabChange($event)"
        />
        <div class="flex-grow">
            <SelectLayer
                v-if="mapStore.findActiveIDX(props.mapParams.mapID, props.mapParams.mapType) != -1"
                :map-params="props.mapParams"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import TabMenu from 'primevue/tabmenu'
import { ref } from "vue"
import { useMap } from "@/store/map"
import { useWildfireList } from "@/store/selectfire"
import SelectLayer from "./SelectLayer.vue"
import type { MapParamsType } from '@/types/mapTypes'

const mapStore = useMap()
const props = defineProps<{
    mapParams: MapParamsType,
    templateID,
    preselected
}>()

const fireListStore = useWildfireList()

const items = ref([
    {
        label: 'Select Map Layers',
        icon: 'pi pi-fw pi-map',
    }
])

const showSelectFire = ref(true)
const showSelectLayer = ref(false)

function onTabChange(evt) {
    if (evt.index == 0) {
        showSelectFire.value = true
        showSelectLayer.value = false
    } else if (evt.index == 1) {
        showSelectLayer.value = true
        showSelectFire.value = false
    }
}
</script>

<style scoped>
.tabmenu-container {
  width: 100%;
  height: 100%;
}
.router-container {
    /* overflow-y: scroll; */
    height: 100%;
} 

</style>
