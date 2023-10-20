<template>
    <div> 
        <h1 :id="`title-${mapParams.mapID}`" />
        <p :id="`body-${mapParams.mapID}`" />
    </div>
    <div v-if="hasScales">
        <div
            v-for="scale in props.scheme.scales"
            :key="scale.variable"
            class="InfoPanel-checkbox-scales"
        >
            <InfoPanelScale :scale="scale" />
        </div>
    </div>
    <Divider />
    <div
        v-for="option in props.scheme.options"
        :key="option.name"
        class="InfoPanel-checkbox"
    >
        <Checkbox
            v-model="selectedOptions"
            :value="option.name"
            @input="optionsChanged"
        />
        <label>{{ option.name }}</label>
    </div>
</template>

<script setup lang="ts">
import InfoPanelScale from './InfoPanelScale.vue'
import { InfoPanelProps } from '@/types/mapTypes'
import { watch, ref, onMounted, inject } from 'vue'
import Checkbox from 'primevue/checkbox'
import Divider from 'primevue/divider'
import { MAP_PARAMS_KEY } from '@/injectionKeys'

const emit = defineEmits(['settings-changed'])
const mapParams = inject(MAP_PARAMS_KEY)

const props = defineProps<{
    scheme: InfoPanelProps.Settings
}>()

const hasScales = props.scheme.scales !== undefined

const selectedOptions = ref([])
props.scheme.options.forEach((option) => {
    if (option.default) {
        selectedOptions.value.push(option.name)
    }
})
console.log(selectedOptions.value)

onMounted(() => {
    document.getElementById(`title-${mapParams.mapID}`).innerHTML = props.scheme.title
    document.getElementById(`body-${mapParams.mapID}`).innerHTML += props.scheme.info
})

const optionsChanged = (value) => {
    let updatedSettings = {}

    props.scheme.options.forEach((option) => updatedSettings[option.emitVal] = selectedOptions.value.includes(option.name))
    console.log(selectedOptions.value)
    emit('settings-changed', updatedSettings)
}

</script>

<style scoped>

.InfoPanel-checkbox {
    text-align: left;
    padding-bottom: 10px;
}
.InfoPanel-checkbox label {
    padding-left: 10%;
}
</style>
