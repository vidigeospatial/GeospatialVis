<template>
    <div class="DeckGLToolTipContainer">
        {{ text }}
    </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'

const props = defineProps<{
    text: string
}>()

const { text } = toRefs(props)

</script>
<style scoped>
.DeckGLToolTipContainer {
    z-index: 1;
    position: absolute;
    color: #a0a7b4;
    background-color: #29323c;
    padding: 10px;
    margin: 24px;
}
</style>