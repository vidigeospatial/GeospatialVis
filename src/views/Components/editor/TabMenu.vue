<template>
    <div class="h-full flex flex-col">
        <TabMenu
            :model="items"
            class="h-auto"
            @tab-change="onTabChange($event)"
        />
        <div class="flex-grow">
            <SelectFire
                v-if="showSelectFire && fireListStore.isFireListReady"
                :map-params="props.mapParams"
                :template-i-d="props.templateID"
                :preselected="props.preselected"
            />
            <SelectLayer
                v-if="showSelectLayer"
                :map-params="props.mapParams"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import TabMenu from 'primevue/tabmenu'
import { ref } from "vue"
import { useWildfireList } from "@/store/selectfire"
import SelectFire from "./SelectFire.vue"
import SelectLayer from "./SelectLayer.vue"
import { MapParamsType } from '@/types/mapTypes'

const props = defineProps<{
    mapParams: MapParamsType,
    templateID: string,
    preselected
}>()

const fireListStore = useWildfireList()

const items = ref([
    {
        label: 'Select a Fire',
        icon: 'pi pi-fw pi-list',
    },
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
