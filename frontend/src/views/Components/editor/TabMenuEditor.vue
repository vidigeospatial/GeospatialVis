<template>
    <div class="tabmenueditor-container">
        <TabMenu
            :model="items "
            class="tabmenueditor"
            @tab-change="onTabChange($event)"
        />
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
        <AnnotationsManager
            v-if="showAnnotationsManager"
            :map-params="mapParams"
        />
    </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router' 
import TabMenu from 'primevue/tabmenu'
import { createApp, ref, computed, onMounted, PropType  } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useWildfireList } from "../../../store/selectfire"
import SelectFire from "./SelectFire.vue"
import SelectLayer from "./SelectLayer.vue"
import AnnotationsManager from "./ui/AnnotationsManager.vue"
import type { MapParamsType } from '@/types/mapTypes'

const props = defineProps<{
    mapParams: MapParamsType,
    templateID: string,
    preselected: string,
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
    },
    {
        label: 'Manage Annotations',
        icon: 'pi pi-fw pi-map-marker',
    }
])

const showSelectFire = ref(true)
const showSelectLayer = ref(false)
const showAnnotationsManager = ref(false)

function onTabChange(evt) {
    if (evt.index == 0) {
        showSelectFire.value = true
        showSelectLayer.value = false
        showAnnotationsManager.value = false
    } else if (evt.index == 1) {
        showSelectLayer.value = true
        showSelectFire.value = false
        showAnnotationsManager.value = false
    } else if (evt.index == 2) {
        showSelectLayer.value = false
        showSelectFire.value = false
        showAnnotationsManager.value = true
    }
}
</script>

<style scoped>
.tabmenueditor-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
}
.tabmenueditor {
    height: fit-content;
}
.router-container {
    flex: 1;
}

</style>
