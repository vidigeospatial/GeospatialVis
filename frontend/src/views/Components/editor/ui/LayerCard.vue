<template>
    <div
        class="layerCard"
        :dataID="props.element.name"
    >
        <img
            :src="getImgURL(props.element.icon)"
            style="width: 100%"
        >
        {{ props.element.name }}
        <Tooltip
            direction="top"
            :description="props.element.description"
        />
    </div>
</template>

<script lang="ts" setup>
import Tooltip from "./Tooltip.vue"
import type { LayerCardContent } from "@/types/ui"
const props = defineProps<{
    element: LayerCardContent
}>()

function getImgURL(imageName) {
    console.log("imageName: " + imageName)
    return new URL("../../../../assets/images/layerIcons/" + imageName + ".png", import.meta.url).href
    // if (imageName.length === 0) 
    //     return new URL("../../../../assets/images/" + "placeholder.jpeg", import.meta.url).href
    // else if (imageName.length > 0)
    //     return new URL("../../../../assets/images/layerIcons/" + imageName + ".png", import.meta.url).href
    // else
    //     return new URL("../../../../assets/images/images/" + imageName + ".png", import.meta.url).href
}

</script>

<style scoped>

.layerCard {
    display: inline-block;
    width: 20%;
}

</style>
@/types/uiTypes