<template>
    <div class="fullscreen">
        <div class="container">
            <SlidesPreview
                v-if="template789"
                :key="slideID"
                :allPresentation="currentPresentation"
            />

            <TextSlides
                v-if="showTextSlides"
                :allPresentation="currentPresentation"
            />
            <Dashboard
                v-if="showDashboard"
                :OverviewMapParams="mapParams1"
                :SingleFireMapParams="mapParams2"
                :preselected="preselected"
            />
            <SingleFirePage
                v-if="showSingleFire"
                :mapParams="mapParams"
                :preselected="preselected"
            />
            <FireComparison
                v-if="showFireComparison"
                :leftMapParams="mapParams1"
                :rightMapParams="mapParams2"
                :leftPreselected="preselected1"
                :rightPreselected="preselected2"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, nextTick, watch } from "vue"
import router from "../../router/index"
import { useStory } from "../../store/stories"
import { onBeforeRouteLeave, useRoute } from "vue-router"
import SlidesPreview from "../Components/presenter/SlidesPreview.vue"
import { MapParamsType } from "@/types/mapTypes"

import Dashboard from "./Dashboard.vue"
import SingleFirePage from "./SingleFirePage.vue"
import FireComparison from "./FireComparison.vue"
import TextSlides from "./TextSlides.vue"

const useStoryStore = useStory()
const route = useRoute()

// These will change over the course of the slideshow
let scriptID = parseInt(route.params.scriptID.toString())
let slideID = parseInt(route.params.slideID.toString())
useStoryStore.updateCardIndex(scriptID)
useStoryStore.updateSlideIndex(slideID)
useStoryStore.updateCurrentStory(scriptID)
useStoryStore.updateCurrentSlide(slideID)

const currentPresentation = ref(useStoryStore.getAllPresentation[scriptID]) // [slide1, slide2, slide3]
const slidesLength = ref(currentPresentation.value.length)

// For template T7 T8 T9
const template789 = ref(false)

// For single map templates
const mapParams: Ref<MapParamsType> = ref()
const preselected: Ref<string> = ref("")

// For two map templates
const mapParams1: Ref<MapParamsType> = ref()
const mapParams2: Ref<MapParamsType> = ref()
const preselected1 = ref("")
const preselected2 = ref("")

const textSlidesParams = ref({})

const showTextSlides = ref(false)
const showDashboard = ref(false)
const showSingleFire = ref(false)
const showFireComparison = ref(false)

loadSlide()

// Use a watcher on the params to grab when the slides change
watch(
    () => route.params,
    (to, from) => {
        showTextSlides.value = false
        showDashboard.value = false
        showSingleFire.value = false
        showFireComparison.value = false
        template789.value = false
        nextTick(() => {
            // Update the slideID and scriptID
            scriptID = parseInt(to.scriptID.toString())
            slideID = parseInt(to.slideID.toString())
            useStoryStore.updateCardIndex(scriptID)
            useStoryStore.updateSlideIndex(slideID)
            useStoryStore.updateCurrentStory(scriptID)
            useStoryStore.updateCurrentSlide(slideID)
            loadSlide()
        })
    }
)

function loadSlide() {
    let slidesObj = currentPresentation.value[slideID]
    console.log("slidesObj: ", slidesObj)
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
        mapParams1.value = slidesObj.OverviewMapParams
        mapParams2.value = slidesObj.SingleMapParams
        preselected.value = slidesObj.fire_id
        showDashboard.value = true
    }
    else if (template == "T5") { // SingleFire
        mapParams.value = slidesObj.mapParams
        preselected.value = slidesObj.fire_id
        showSingleFire.value = true
    }
    else if (template == "T6") { // Comparison
        mapParams1.value = slidesObj.LeftMapParams
        mapParams2.value = slidesObj.RightMapParams
        preselected1.value = slidesObj.fire_id_left
        preselected2.value = slidesObj.fire_id_right
        showFireComparison.value = true
    }
    else if (template == "T7" || template == "T8" || template == "T9") {
        template789.value = true
    }
    else {
        throw 'Error in displaySlides'
    }

}

function updateSlides(event) {
    let temp = parseInt(slideID.toString())
    if (event.keyCode === 39 && temp >= 0 && temp + 1 < slidesLength.value) {
    // press right key
        temp++
        router.push(`/slideshow/${scriptID}/${temp}`)
    } else if (event.keyCode === 37 && temp - 1 >= 0) {
        temp--
        router.push(`/slideshow/${scriptID}/${temp}`)
    } else if (event.keyCode === 27) {
        router.push("/stories")
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
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

p {
  margin: 5%;
}

.container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
}
</style>
