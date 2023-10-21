<template>
    <div class="fullscreen">
        <TextSlides
            v-if="showTextSlides"
            :text-slides-params="textSlidesParams"
        />
        <Dashboard
            v-if="showDashboard"
            :overview-map-params="mapParams_1"
            :single-fire-map-params="mapParams_2"
            :preselected="preselected"
        />
        <SingleFirePage
            v-if="showSingleFire"
            :mapParams="mapParams"
            :preselected="preselected"
        />
        <FireComparison
            v-if="showFireComparison"
            :map-params="mapParams"
            :preselected="preselected"
            :left-fire-map-params="mapParams_1"
            :right-fire-map-params="mapParams_2"
            :left-preselected="preselected_1"
            :right-preselected="preselected_2"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router' 
import router from "../../router/index"
import { useStory } from '../../store/stories'

import Dashboard from "./Dashboard.vue"
import SingleFirePage from "./SingleFirePage.vue" 
import FireComparison from "./FireComparison.vue"
import TextSlides from "./TextSlides.vue"

const useStoryStore = useStory()
const presentation = useStoryStore.getAllPresentation
const route = useRoute()

// These will change over the course of the slideshow
let scriptID = parseInt(route.params.scriptID as string)
let slideID = parseInt(route.params.slideID as string)
let card_index = useStoryStore.getCardindex
let slidesLength = presentation[card_index].length

// For single map templates
const mapParams = ref({})
const preselected = ref("")

// For two map templates
const mapParams_1 = ref({})
const mapParams_2 = ref({})
const preselected_1 = ref("")
const preselected_2 = ref("")

const textSlidesParams = ref({})

const showTextSlides = ref(false)
const showDashboard = ref(false)
const showSingleFire = ref(false)
const showFireComparison = ref(false)

// console.log(presentation[scriptID][slideID]);

loadSlide()

// Use a watcher on the params to grab when the slides change
watch(() => route.params, (to, from) => { 
    showTextSlides.value = false
    showDashboard.value = false
    showSingleFire.value = false
    showFireComparison.value = false
    nextTick(() => {
    // Update the slideID and scriptID
        scriptID = parseInt(to.scriptID as string)
        slideID = parseInt(to.slideID as string)

        loadSlide()
    })
})

function loadSlide() {
    let slidesObj = presentation[scriptID][slideID]
    console.log(slidesObj)
    let template = slidesObj.type

    if (template == "T1") { // template1
        textSlidesParams.value = slidesObj.textSlidesParams
        showTextSlides.value = true
    }
    else if (template == "T2") { // template2
        textSlidesParams.value = slidesObj.textSlidesParams
        showTextSlides.value = true
    }
    else if (template == "T3") { // template3
        textSlidesParams.value = slidesObj.textSlidesParams
        showTextSlides.value = true
    }
    else if (template == "T4") { // Dashboard
        mapParams_1.value = slidesObj.OverviewMapParams
        mapParams_2.value = slidesObj.SingleFireMapParams
        preselected.value = slidesObj.fire_id
        showDashboard.value = true
    }
    else if (template == "T5") { // SingleFire
        mapParams.value = slidesObj.mapParams   
        preselected.value = slidesObj.fire_id
        showSingleFire.value = true
    }
    else if (template == "T6") { // SingleFire
        mapParams_1.value = slidesObj.LeftMapParams
        mapParams_2.value = slidesObj.RightMapParams
        preselected_1.value = slidesObj.fire_id_left
        preselected_2.value = slidesObj.fire_id_right
        showFireComparison.value = true
    }
    else {
        throw 'Error in displaySlides'
    }

}

function updateSlides(event) {
    if (event.keyCode === 39 && slideID >= 0 && (slideID + 1) < slidesLength) { // press right key
        slideID++
        router.push(`/slides/${scriptID}/${slideID}`)
    }
    else if (event.keyCode === 37 && slideID - 1 >= 0) {
        slideID--
        router.push(`/slides/${scriptID}/${slideID}`)
    }
    else if (event.keyCode === 27) {
        router.push('/stories')
    }

}

onBeforeRouteLeave((to, from) => {
    document.removeEventListener("keyup", updateSlides)
})
onMounted(() => {
    document.addEventListener("keyup", updateSlides)
})

</script>

<style scoped>
.fullscreen {
    height: 100vh;
    width: 100%;
}
</style>
