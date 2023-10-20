<template>
    <div class="InfoPanelContainer">
        <div id="InfoPanelContainer-dropdownarray">
            <Dropdown
                v-model="selectedLayer"
                class="InfoPanelDropdown"
                :options="layers"
                option-label="name"
                placeholder="Select a Layer"
                @change="changed"
            />
            <Button
                :icon="infoPanelTogglerIcon"
                :style="{height: 'fit-content'}"
                @click="toggleInfoPanel"
            />
        </div>
        <div v-show="showInfoPanel">
            <InfoPanelDynamicRenderer
                :schema="schema"
                :selectedSchema="selectedSchema"
                @settings-changed="settingsChanged"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, computed, nextTick } from 'vue'
import InfoPanelDynamicRenderer from './InfoPanelDynamicRenderer.vue'
import InfoPanelCheckbox from './InfoPanelCheckbox.vue'
import InfoPanelCheckboxDropdown from './InfoPanelCheckboxDropdown.vue'
import InfoPanelText from './InfoPanelText.vue'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { InfoPanelProps } from '@/types/mapTypes'

const infoPanelTogglerIcon = ref('pi pi-minus')
const showInfoPanel = ref(true)
const toggleInfoPanel = () => {
    showInfoPanel.value = !showInfoPanel.value
    infoPanelTogglerIcon.value = showInfoPanel.value ? 'pi pi-minus' : 'pi pi-plus'
}

const emit = defineEmits(['settings-changed'])

const props = defineProps<{
    settings: InfoPanelProps.Settings[]
}>()

const layers = ref(props.settings.map( (element) => ({ name: element.title, id: element.id })))
const selectedLayer = ref(layers.value[0])

const resolveInfoPanelObject = (id) => {
    if (id === 'checkbox') 
        return InfoPanelCheckbox
    if (id === 'text') 
        return InfoPanelText
    if (id === 'checkbox-dropdown') 
        return InfoPanelCheckboxDropdown
}

const schema = props.settings.map( (element) => ({ 
    ...element,
    type: resolveInfoPanelObject(element.type)
}))

const selectedSchema = computed(() => (schema.findIndex(d => d.id === selectedLayer.value.id)).toString())

const changed = () => {
    nextTick(() => {
        console.log(selectedLayer.value)
    })
}

const settingsChanged = (value) => {
    emit('settings-changed', value)
}

</script>

<style scoped>
.InfoPanelContainer{
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    font-size: 18px;
    position: absolute;
    top: 0;
    right: 0;
    width: 400px;
    margin: 24px;
    background: #fff;
    color: black;
    padding: 10px 24px;
    max-height: 96%;
    overflow-x: hidden;
    overflow-y: auto;
    overflow-y: overlay;
    outline: none;
    z-index: 1;
}
.InfoPanelContainer p {
    text-align: left;
}

.InfoPanelDropdown{
    margin: 10px;
    text-align: center;
    width: 70%;
}
#InfoPanelContainer-dropdownarray{
    display: flex;
    justify-content: space-evenly;
    align-items: center;
}
</style>