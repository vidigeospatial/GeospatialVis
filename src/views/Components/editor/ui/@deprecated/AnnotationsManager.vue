<template>
    <div
        id="label"
        class="label-container"
    >
        <p class="labelStyle">
            Manage Annotations
        </p>
        <Tooltip
            direction="topRight"
            :description="description"
        />
    </div>
    <div class="annotationsManager">
        <Toast />
        <DataTable
            v-model:selection="annotations_to_store"
            v-model:filters="filters"
            :value="data"
            :row-hover="true"
            :scrollable="true"
            scroll-height="flex"
            sort-field="timestamp"
            :sort-order="1"
            state-storage="session"
            :state-key="`state-key-editor-${props.mapParams.mapID}`"
            :rows="8"
            :paginator="true"
            class="p-datatable-sm"
            data-key="id"
            filter-display="menu"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            :global-filter-fields="['timestamp', 'location', 'text']"
        >
            <template #header>
                <div class="headerTable">
                    <Button
                        type="button"
                        icon="pi pi-save"
                        label="Save"
                        class="p-button-outlined"
                        @click="saveAnnotations()"
                    />
                    <!-- <Button type="button" icon="pi pi-pencil" label="Edit" class="p-button-outlined" -->
                    <!-- @click="editAnnotation()" /> -->
                    <span class="p-input-icon-left push">
                        <i class="pi pi-search" />
                        <InputText
                            v-model="filters['global'].value"
                            placeholder="Keyword Search"
                        />
                    </span>
                </div>
            </template>
            <template #empty>
                No Annotations Found
            </template>
            <template #loading>
                Loading Annotations. Standby
            </template>

            <!-- <Column selectionMode="multiple" headerStyle="width: 1rem"></Column> -->
            <Column
                field="timestamp"
                header="Time"
                data-type="date"
            >
                <template #body="slotProps">
                    {{ slotProps.data.timestamp }}
                </template>
            </Column>
            <Column
                field="location"
                filter-field="location"
                header="Location"
            >
                <template #body="slotProps">
                    {{ formatLocation(slotProps.data.location) }}
                </template>
            </Column>
            <Column
                field="text"
                filter-field="text"
                header="Text"
            >
                <template #body="slotProps">
                    <Textarea
                        v-model="slotProps.data.text"
                        rows="4"
                        cols="20"
                        disabled
                    />
                </template>
            </Column>
            <Column
                field="text"
                filter-field="relevantLayers"
                header="Layers"
            >
                <template #body="slotProps">
                    <div v-if="slotProps.data.relevantLayers.length > 0">
                        <Chip
                            v-for="layer of slotProps.data.relevantLayers"
                            :key="layer.name"
                            :label="layer.name"
                        />
                    </div>
                    <Chip
                        v-else
                        label="None"
                    />

                    <!-- {{ slotProps.data.relevantLayers.length > 0 ? slotProps.data.relevantLayers.map(l => l.name).toString() : 'None' }} -->
                </template>
            </Column>
            <Column header="Status">
                <template #body="slotProps">
                    <Tag
                        :value="slotProps.data.saveStatus ? 'Saved' : 'Not Saved' "
                        :severity="slotProps.data.saveStatus ? 'success' : 'danger'"
                    />
                </template>
            </Column>
            <Column header="Edit">
                <!-- Expose the index to the button -->
                <template #body="{ data }">
                    <Button
                        type="button"
                        icon="pi pi-pencil"
                        rounded
                        outlined
                        @click="editAnnotation(data)"
                    />
                </template>
            </Column>
            <Column header="Delete">
                <!-- Expose the index to the button -->
                <template #body="{ data }">
                    <Button
                        type="button"
                        icon="pi pi-times"
                        rounded
                        outlined
                        @click="removeAnnotation(data)"
                    />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, PropType, watch, nextTick, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { FilterMatchMode, FilterOperator } from 'primevue/api'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Chip from 'primevue/chip' 
import Tooltip from "./Tooltip.vue"
import Textarea from 'primevue/textarea'
import _ from 'lodash'

import { MapState } from '@/types/mapTypes'
import { useToast } from 'primevue/usetoast'
import type { MapParamsType } from '@/types/mapTypes'

import { useMap } from '@/store/map'
import { useEditor } from '@/store/editor'
import Toast from 'primevue/toast'
const annotations_to_store = ref()
const editingRows = ref([])
const useMapStore = useMap()
const useEditorStore = useEditor()
const toast = useToast()

const description = "Manage Annotations"

const props = defineProps({
    options: Array,
    mapParams: Object as PropType<MapParamsType>,
    templateID: String,
    preselected: String,
})

const formatLocation = (location) => `(${location[0].toFixed(2)}, ${location[1].toFixed(2)})`

/**
 * Feed the annotations to the table
 */
const data = ref([])

const annotationObjectGetter = () => {
    let curSlideParams = useEditorStore.currentPresentation[useEditorStore.slideID]
    if (curSlideParams.annotations){
        return curSlideParams.annotations
    } else {
        if (props.mapParams.mapID == curSlideParams['LeftMapParams'].mapID){
            return curSlideParams['annotations_left']
        }
        if (props.mapParams.mapID == curSlideParams['RightMapParams'].mapID){
            return curSlideParams['annotations_right']
        }
    }
    
}

watch(annotationObjectGetter, (newVal) => {
    if (!newVal) {
        return
    }
    let idx = useMapStore.findActiveIDX(props.mapParams.mapID, props.mapParams.mapType)
    const checkStored = (annotation) => {
        let matchedAnnotation = (useMapStore.deckGLMapState[idx]._data as MapState.IMapData).annotations.find((a) => a.id == annotation.id)
        return matchedAnnotation && _.isEqual(matchedAnnotation, annotation)
    }
    data.value = newVal.map((annotation) => ({
        id: annotation.id,
        timestamp: annotation.timestamp,
        location: annotation.location,
        text: annotation.text,
        relevantLayers: annotation.relevantLayers,
        saveStatus: checkStored(annotation)
    }))
}, { deep: true, immediate: true })
// const data = computed(() => {
//     let annotation_data = useEditorStore.slideState[props.editingSlideID]
//     // console.log('Annotation Data: ', annotation_data)

//     return annotation_data.annotations.map((annotation) => {
//         return {
//             id: annotation.id,
//             timestamp: annotation.timestamp,
//             location: annotation.location,
//             text: annotation.text,
//             relevantLayers: annotation.relevantLayers,
//             saveStatus: false
//         }
//     });
// })

const filters = ref({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const clearFilter = () => {
    filters.value = {
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
    }
}

const formatAnnotations = () => {
    let annotations = []
    data.value.forEach((annotation, index) => {
        let newAnnotation = {
            "id": annotation.id,
            "timestamp": annotation.timestamp,
            "location": annotation.location,
            "text": annotation.text,
            "relevantLayers": annotation.relevantLayers,
            "highlighted": false
        }
        annotations.push(newAnnotation)
    })
    return annotations
}

const saveAnnotations = () => {
    const annotationObjectGetter = () => {
        let curSlideParams = useEditorStore.currentPresentation[useEditorStore.slideID]
        if (curSlideParams.annotations){
            return curSlideParams.annotations
        } else {
            if (props.mapParams.mapID == curSlideParams['LeftMapParams'].mapID){
                return curSlideParams['annotations_left']
            }
            if (props.mapParams.mapID == curSlideParams['RightMapParams'].mapID){
                return curSlideParams['annotations_right']
            }
        }
    
    }
    let annotations = formatAnnotations()
    let newSlideState = useEditorStore.getcurrentSlide()

    if (newSlideState.annotations){
        newSlideState['annotations'] = annotations
    } else {
        if (props.mapParams.mapID == newSlideState['LeftMapParams'].mapID){
            newSlideState['annotations_left'] = annotations
        }
        if (props.mapParams.mapID == newSlideState['RightMapParams'].mapID){
            newSlideState['annotations_right'] = annotations
        }

    }
    // useEditorStore.setSlideState(props.editingSlideID, newSlideState)
    useEditorStore.updateSlide(newSlideState, useEditorStore.scriptID, useEditorStore.slideID)

    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `${annotations.length} Annotations Saved`,
        life: 3000
    })

    let idx = useMapStore.findActiveIDX(props.mapParams.mapID, props.mapParams.mapType);
    (useMapStore.deckGLMapState[idx]._data as MapState.IMapData).annotations = JSON.parse(JSON.stringify(annotations))
}

const editAnnotation = (data) => {
    // console.log(data, index)
    // Index is id of annotation here
    // Once edit is clicked fire the editAnnotation mutation to open the editor
    // console.log("Editing annotation: ", data.value[index], index)
    useEditorStore.editAnnotation(useEditorStore.scriptID, useEditorStore.slideID, props.mapParams.mapID, data.id)
}
const removeAnnotation = (data) => {
    useEditorStore.removeAnnotation(useEditorStore.scriptID, useEditorStore.slideID, data.id)
}

</script>

<style scoped>

.annotationsManager {
    width: 100%;
}

.headerTable {
    display: flex;
    justify-content: space-between;
}

.headerTable .push {
    margin-left: auto;
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
  background-color: #f8f9fa;
}
</style>
