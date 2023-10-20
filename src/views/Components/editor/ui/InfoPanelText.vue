<template>
    <div> 
        <h1 :id="`title-${mapParams.mapID}`" />
        <div :id="`body-${mapParams.mapID}`" />
    </div>
    <Divider />
    <div v-if="hasScales">
        <div
            v-for="scale in props.scheme.scales"
            :key="scale.variable"
            class="InfoPanel-text-scales"
        >
            <InfoPanelScale :scale="scale" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import InfoPanelScale from './InfoPanelScale.vue'
import Divider from 'primevue/divider'
import { MAP_PARAMS_KEY } from '@/injectionKeys'
import { InfoPanelProps } from '@/types/mapTypes'
const mapParams = inject(MAP_PARAMS_KEY)

// Seems like we need this because the dynamic renderer listens for this even though the textpanel doesn't care to emit anything.
const emit = defineEmits(['settings-changed'])

const props = defineProps<{
    scheme: InfoPanelProps.Settings
}>()


const hasScales = props.scheme.scales !== undefined

onMounted(() => {
    document.getElementById(`title-${mapParams.mapID}`).innerHTML = props.scheme.title
    document.getElementById(`body-${mapParams.mapID}`).innerHTML += props.scheme.info
})

</script>
<style scoped>
.legend {
    display: inline-block;
    height: 20px;
}
</style>

