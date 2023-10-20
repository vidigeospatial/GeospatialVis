<template>
    <div> 
        <h1 :id="`title-${mapParams.mapID}`" />
        <p :id="`body-${mapParams.mapID}`" />
    </div>
    <Divider />
    <div v-if="hasScales">
        <div
            v-for="scale in props.scheme.scales"
            :key="scale.variable"
            class="InfoPanel-checkboxdropdown-scales"
        >
            <InfoPanelScale :scale="scale" />
        </div>
    </div>
    <Divider />
    <div
        v-for="option in checkboxOptions"
        :key="option.name"
        class="InfoPanel-checkboxdropdown-checkbox"
    >
        <Checkbox
            v-model="selectedOptionsCheckbox"
            :value="option.name"
            @input="optionsChanged"
        />
        <label>{{ option.name }}</label>
    </div>
    <Divider />
    <h3> {{ dropdownOptions.name }} </h3>
    <Dropdown
        v-model="selectedDropdownOptions"
        class="InfoPanel-checkboxdropdown-dropdown"
        :options="dropdownOptionsFormatted"
        option-label="name"
        placeholder="Select"
        @change="optionsChanged"
    />
</template>

<script setup lang="ts">
import InfoPanelScale from './InfoPanelScale.vue'
import { watch, inject, computed, ref, onMounted } from 'vue'
import { InfoPanelProps } from '@/types/mapTypes'
import Checkbox from 'primevue/checkbox'
import Divider from 'primevue/divider'
import Dropdown from 'primevue/dropdown'
import { MAP_PARAMS_KEY } from '@/injectionKeys'

const mapParams = inject(MAP_PARAMS_KEY)

onMounted(() => {
    document.getElementById(`title-${mapParams.mapID}`).innerHTML = props.scheme.title
    document.getElementById(`body-${mapParams.mapID}`).innerHTML += props.scheme.info
})

const emit = defineEmits(['settings-changed'])
const props = defineProps<{
    scheme: InfoPanelProps.Settings
}>()

const hasScales = props.scheme.scales !== undefined

let dropdownOptions = props.scheme.options.filter((option) => option.type === "dropdown")[0]
const dropdownOptionsFormatted = dropdownOptions.values.map((option, index) => ({ name: option, id: index }))

const selectedDropdownOptions = ref(dropdownOptionsFormatted[0])
const checkboxOptions = props.scheme.options.filter((option) => option.type === "checkbox")

const selectedOptionsCheckbox = ref([])
const selectedOptionsDropdown = ref(dropdownOptions.values[0])

props.scheme.options.forEach((option) => {
    if (option.default) {
        selectedOptionsCheckbox.value.push(option.name)
    }
})

const optionsChanged = (value) => {
    // Need to check for checkbox and dropdown
    let updatedSettings = {}
    let temp = dropdownOptions
    let temp2 = selectedDropdownOptions

    checkboxOptions.forEach((option) => updatedSettings[option.emitVal] = selectedOptionsCheckbox.value.includes(option.name))
    updatedSettings[dropdownOptions.emitVal] = selectedDropdownOptions.value.name
    emit('settings-changed', updatedSettings)
}

</script>

<style scoped>

.InfoPanel-checkboxdropdown-checkbox {
    text-align: left;
    padding: 5px;
}
.InfoPanel-checkboxdropdown-checkbox label {
    padding-left: 10%;
}
.InfoPanel-checkboxdropdown-dropdown {
    text-align: center;
}
</style>
