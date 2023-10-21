<template>
    <div
        id="fireTableList"
        class="fireList"
    >
        <DataTable
            :value="data"
            :row-hover="true"
            :scrollable="true"
            scroll-height="flex"
            v-model:selection="tableSelection"
            sort-field="perimeters"
            v-model:filters="filters"
            :sort-order="-1"
            state-storage="session"
            :state-key="`state-key-${props.mapParams.mapID}`"
            :rows="8"
            :paginator="true"
            class="p-datatable-sm"
            data-key="id"
            filter-display="menu"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            :global-filter-fields="['name', 'year', 'acres', 'perimeters']"
        >
            <template #header>
                <div class="headerTable">
                    <Button
                        type="button"
                        icon="pi pi-filter-slash"
                        label="Clear"
                        class="p-button-outlined"
                        @click="clearFilter()"
                    />
                    <!-- <i class="pi pi-filter-slash" style="color: black; font-size: .75rem;"/> -->
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText
                            v-model="filters['global'].value"
                            placeholder="Keyword Search"
                        />
                    </span>
                </div>
            </template>
            <template #empty>
                No fires found.
            </template>
            <template #loading>
                Loading fire data. Please wait.
            </template>

            <Column selection-mode="single" />
            <Column
                field="name"
                header="Name"
            >
                <template #body="{ data }">
                    {{ data.name }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText
                        v-model="filterModel.value"
                        type="text"
                        class="p-column-filter"
                        placeholder="Search by name"
                    />
                </template>
            </Column>
            <Column
                filter-field="year"
                data-type="numeric"
                header="Year"
            >
                <template #body="{ data }">
                    {{ data.year }}
                </template>
                <template #filter="{ filterModel }">
                    <InputNumber v-model="filterModel.value" />
                </template>
            </Column>
            <Column
                filter-field="acres"
                data-type="numeric"
                header="Acres"
            >
                <template #body="{ data }">
                    {{ data.acres }}
                </template>
                <template #filter="{ filterModel }">
                    <InputNumber
                        v-model="filterModel.value"
                        mode="decimal"
                        :min-fraction-digits="2"
                    />
                </template>
            </Column>
            <Column
                filter-field="perimeters"
                data-type="numeric"
                header="Perimeters"
            >
                <template #body="{ data }">
                    {{ data.perimeters }}
                </template>
                <template #filter="{ filterModel }">
                    <InputNumber v-model="filterModel.value" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script lang="ts" setup>
import { reactive, inject, ref, watch, nextTick } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { FilterMatchMode, FilterOperator } from 'primevue/api'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { MapParamsType } from '@/types/mapTypes'
import { MAP_MODE_KEY }  from '@/injectionKeys'

import { faChargingStation } from '@fortawesome/free-solid-svg-icons'
import identifier from "@/store/localdb/identifiers.json"

import { useWildfireList } from "@/store/selectfire"
import { useMap } from '@/store/map'
// import { useEditor } from '@/store/editor'

const tableSelection = ref()
const useMapStore = useMap()
// const useEditorStore = useEditor()

const props = defineProps<{
    options: Array<any>
    mapParams: MapParamsType
    templateID: string
    preselected: string
}>()

// const props = defineProps({
//     options: Array,
//     mapParams: Object,
//     templateID: String,
//     preselected: String
// })

// Need a nextTick here so that adding the value actually takes affect 
if (props.preselected !== "") {
    nextTick(() => {
        tableSelection.value = props.options.filter(fire => fire.id == props.preselected)[0]
    })
}

const mapMode = inject(MAP_MODE_KEY)

/*
      debugger;
    let wildfireStore = useWildfireList()
      if (wildfireStore.fire !== undefined){
          this.selected = wildfireStore.fire.name;
      }
      */

// let layerList = reactive([...layerListDesc]);

const data = ref(props.options)
const filters = ref({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    'year': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    'acres': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    'perimeters': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
})

const clearFilter = () => {
    filters.value = {
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
        'name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'year': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        'acres': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        'perimeters': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
    }
}

watch(tableSelection, () => {
    console.log("table_selection changed", tableSelection.value)
    console.log(tableSelection.value)

    let previousFireSelection = useWildfireList().fire[props.templateID]

    // Make validFire for this template false, if there was a previous fire selection
    // and it's not the same as the current selection
    if (tableSelection.value && previousFireSelection
    && (previousFireSelection.id != tableSelection.value.id)) {
        useWildfireList().validFire[props.templateID] = false
    }

    // Make sure SingleFire is updated (v-if'ed on validFire right now. Probs a better way)
    nextTick(() => {

        useWildfireList().fire[props.templateID] = tableSelection.value

        if (tableSelection.value.year == undefined) {
            return
        }

        if (tableSelection.value.year !== -1) {
            useWildfireList().validFire[props.templateID] = true
        }

        // if(useMapStore.mapStateExists(props.mapParams.mapID)){
        // If template is Overview, then update the overview map state with selected fire
        if (props.templateID == identifier.mapIdentifier.Overview) {
            console.log("DO I EXIST AS AN ICON YET")
            let activeOverviewMapIDX = useMapStore.deckGLMapState.findIndex((deckMapState) => deckMapState._metaData.mType == "overview" && deckMapState._metaData.active == true)
            useMapStore.deckGLMapState[activeOverviewMapIDX]._data.selectedFire.data = [JSON.parse(tableSelection.value.centroid)]

            /*
    let mapState = useMapStore.getMapStateByID(props.mapParams.mapID)
    let coordinates = JSON.parse( table_selection.value.centroid)
    mapState._data.selectedFire.data = [coordinates]
    */
        }

    })

    // UPDATE STORE
    // Find the correct Overview Map, and find the correct Singlfire Map id
    // update the icon_layer for overview map
    // find the single fire ID or create a new one with the ID.
    useMapStore.$patch((state) => {
    // state.deckGLMapState.find((map) => map._metaData.id.includes(props.mapParams.mapID))._data.layerList = layerList;
    })
    // if (mapMode == 'Editing') {
    //     // Its a single map
    //     if (props.templateID == '1'){
    //         useEditorStore.currentPresentation[useEditorStore.slideID].fire_id = tableSelection.value.id
    //     }
    //     if (props.templateID == '2'){
    //         useEditorStore.currentPresentation[useEditorStore.slideID].fire_id_left = tableSelection.value.id
    //     }
    //     if (props.templateID == '3'){
    //         useEditorStore.currentPresentation[useEditorStore.slideID].fire_id_right = tableSelection.value.id
    //     }
    // }
})

</script>

<style scoped>
.fireTable {
  margin-left: 2px;
}

.fireList {
  width: 95%;
}

.headerTable {
  display: flex;
  justify-content: space-between;
}
</style>
