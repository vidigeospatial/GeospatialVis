<template>
    <div class="SMInfoPanelContainer">
        <div :id="`SMInfoPanelContainer-${mapParams.mapType}-${mapParams.mapID}`" />
    </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, computed, nextTick, inject } from 'vue'
import { MAP_PARAMS_KEY } from '@/injectionKeys'
const mapParams = inject(MAP_PARAMS_KEY)

const emit = defineEmits(['settings-changed'])

const props = defineProps<{
    text: string
}>()


onMounted(() => {
    watch(() => props.text, (newVal) => {
        document.getElementById(`SMInfoPanelContainer-${mapParams.mapType}-${mapParams.mapID}`).innerHTML = newVal
    }, { immediate: true })
})


</script>

<style scoped>
.SMInfoPanelContainer{
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    font-size: 1rem;
    position: absolute;
    top: 0;
    right: 0;
    width: fit-content;
    height: fit-content;
    margin: 15px;
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
</style>