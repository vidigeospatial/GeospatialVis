<template>
    <div class="fullscreen">
        <Toast />
        <div id="mode_switch">
            <div
                v-if="showTextSlides"
                :style="{ width: '40%', display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'start' }"
            >
                <p>Preview</p>
                <InputSwitch v-model="EditMode" />
                <p>Edit</p>
            </div>
            <Button
                type="button"
                label="Save"
                icon="pi pi-save"
                :loading="loading"
                :style="{ margin: '1rem' }"
                @click="saveFile"
            />
        </div>
        <div class="container">
            <Splitter
                style="height: 100%"
            >
                <SplitterPanel :size="15">
                    <div id="slidesEditor-sidebar">
                        <Listbox
                            v-model="selectedSlide"
                            :options="currentPresentation"
                            :optionLabel="listboxLabel"
                            :style="{ width: '80%'}"
                        />
                        <!-- change it to a button -->
                        <!-- <Listbox v-model="selectedAction" :options="actions" optionLabel="name" class="w-full md:w-14rem" /> -->
                        <Dropdown
                            v-model="selectedTemplateToAdd"
                            :options="templates"
                            optionLabel="type"
                            placeholder="Add a Slide"
                            :virtualScrollerOptions="{ itemSize: 38 }"
                            :style="{ width: '80%'}"
                        />
                        <Dropdown
                            v-model="selectedSlideToDelete"
                            :options="currentPresentation"
                            :optionLabel="listboxLabel"
                            placeholder="Delete a Slide"
                            :virtualScrollerOptions="{ itemSize: 38 }"
                            :style="{ width: '80%'}"
                        />
                    </div>
                </SplitterPanel>
                <SplitterPanel :size="99">
                    <div id="slidesEditorWindow">
                        <SlidesPreview
                            v-if="template789"
                            :key="slideID"
                            :allPresentation="currentPresentation"
                        />

                        <!-- <TextSlides v-if="showTextSlides" :textSlidesParams="textSlidesParams" /> -->
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
                        <SingleFireAddAnnotations
                            v-if="showSingleFire"
                            :mapParams="mapParams"
                            :preselected="preselected"
                        />
                        <FireComparisonAddAnnotations
                            v-if="showFireComparison"
                            :preselected="preselected"
                            :leftMapParams="mapParams1"
                            :rightMapParams="mapParams2"
                            :leftPreselected="preselected1"
                            :rightPreselected="preselected2"
                        />

                        <EditSlides
                            v-if="EditMode"
                            :key="slideID"
                            :allPresentation="currentPresentation"
                        />
                    </div>
                </SplitterPanel>
            </Splitter>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Ref, ref, onMounted, nextTick, watch } from "vue"
import router from "@/router/index"
import { useStory } from "@/store/stories"
import { useEditor } from "@/store/editor"
import { onBeforeRouteLeave, useRoute } from "vue-router"
import InputSwitch from "primevue/inputswitch"
import SlidesPreview from "@/views/Components/presenter/SlidesPreview.vue"
import EditSlides from "@/views/Components/editor/EditSlide.vue"
import Listbox from "primevue/listbox"
import Button from "primevue/button"
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import { useToast } from 'primevue/usetoast'
import Toast from  'primevue/toast'
import Dropdown from "primevue/dropdown"
import { MapParamsType } from "@/types/mapTypes"
import { Slide } from "@/types/storiesTypes"

import Dashboard from "../../Pages/Dashboard.vue"
import SingleFireAddAnnotations from "../../Pages/SingleFireAddAnnotations.vue"
import FireComparisonAddAnnotations from "../../Pages/FireComparisonAddAnnotations.vue"
import TextSlides from "../../Pages/TextSlides.vue"

// Storer
const useStoryStore = useStory()
const useEditorStore = useEditor()
const route = useRoute()
const toast = useToast()

// These will change over the course of the slideshow
let scriptID: number = parseInt(route.params.scriptID.toString())
let slideID: number = parseInt(route.params.slideID.toString())

useEditorStore.initialize(JSON.parse(JSON.stringify(useStoryStore.script[scriptID].Presentation)))
const currentPresentation: Ref<Slide[]> = ref(useEditorStore.getcurrentPresentation()) // [slide1, slide2, slide3]
// console.log("editor_currentPresentation: ", currentPresentation.value)
const slidesLength: Ref<number> = ref()
const listboxLabel = (slide) => 'Slide: ' + (currentPresentation.value.indexOf(slide) + 1).toString() + ": " + slide.type

const selectedSlide: Ref<Slide> = ref()

// For template T7 T8 T9
const template789 = ref(false)

// For single map templates
const mapParams: Ref<MapParamsType> = ref()
const preselected: Ref<string> = ref()

// For two map templates
const mapParams1: Ref<MapParamsType> = ref()
const mapParams2: Ref<MapParamsType> = ref()
const preselected1: Ref<string> = ref()
const preselected2: Ref<string> = ref()

// const textSlidesParams = ref({})

const showTextSlides = ref(false)
const showDashboard = ref(false)
const showSingleFire = ref(false)
const showFireComparison = ref(false)

// toggle to Edit Mode
const EditMode = ref(false)

// Reacting to change slides based on keypad
watch(
    () => route.params,
    (to, from) => {
        showTextSlides.value = false
        showDashboard.value = false
        showSingleFire.value = false
        showFireComparison.value = false
        template789.value = false
        selectedSlide.value = currentPresentation.value[slideID]
        nextTick(() => {
            // Update the slideID and scriptID
            scriptID = parseInt(to.scriptID.toString())
            slideID = parseInt(to.slideID.toString())
            useEditorStore.setCurrentIDs(scriptID, slideID)

            selectedSlide.value = currentPresentation.value[slideID]
            loadSlide()
        })
    }, { immediate: true })

// Reacting to change slides based on listbox
watch(selectedSlide, () => {
    if (selectedSlide.value) {
        slideID = currentPresentation.value.indexOf(selectedSlide.value)
        router.push(`/slideseditor/${scriptID}/${slideID}`)
    }
})

// TODO1: Change "+" Listbox to a button
const templates = ref([
    {
        type: "Text Only",
        content: {
            type: "T1",
            header: "Placeholder",
            body: "Placeholder",
            footnote: "Placeholder",
        },
    },
    {
        type: "One Image",
        content: {
            type: "T2",
            header: "Placeholder",
            body: "Placeholder",
            footnote: "Placeholder",
            imgSrc: "Placeholder",
            extImg: false,
        },
    },
    { type: "Two Images", content: { 
        type: "T3",
        header: "Placeholder",
        body: "Placeholder",
        footnote: "Placeholder",
        imgSrc_left: "Placeholder",
        extImg_left: false,
        imgSrc_right: "Placeholder",
        extImg_right: false,

    } },
    { type: "T4", content: {} },
    { type: "Single Map", content: {
        type: "T5",
        annotations: [],
        fire_id: ""
    } },
    { type: "Map Comparison", content: {
        type: "T6",
        fire_id_left: "",
        fire_id_right: "",
        annotations_left: [],
        annotations_right: []
    } },
    {
        type: "T7",
        content: {
            slideID: "undefined",
            type: "T7",
            text: "undefined",
            img: "undefined",
        },
    },
    {
        type: "T8",
        content: {
            slideID: "undefined",
            type: "T8",
            text: "undefined",
            img_left: "undefined",
            img_right: "undefined",
        },
    },
    {
        type: "T9",
        content: {
            slideID: "undefined",
            type: "T7",
            text: "undefined",
            img: "undefined",
            textBlock: "undefined",
        },
    },
])
const selectedTemplateToAdd = ref()
watch(selectedTemplateToAdd, () => {
    // console.log("ADDtemplate: ", selectedTemplate.value)
    let newSlide = selectedTemplateToAdd.value.content
    useEditorStore.AddNewSlide({ ...newSlide }, scriptID, slideID)
    currentPresentation.value = useEditorStore.getcurrentPresentation()
    selectedSlide.value = currentPresentation.value[slideID]
    slidesLength.value = currentPresentation.value.length
})

// TODO: Change "-" Listbox to a button
const selectedSlideToDelete = ref()
watch(selectedSlideToDelete, () => {
    //use Editor Store instead
    useEditorStore.DeleteSlide(currentPresentation.value.indexOf(selectedSlideToDelete.value))
    nextTick(() => {
        currentPresentation.value = useEditorStore.getcurrentPresentation()
        selectedSlide.value = currentPresentation.value[0]
        selectedSlideToDelete.value = null

    })

    // slideID = selectedSlide.value.slideID
    // slidesLength.value = currentPresentation.value.length
})

// Use a watcher on the params to grab when the slides change

function loadSlide() {
    let slidesObj = currentPresentation.value[slideID]
    if (slidesObj == undefined){
        debugger
    }
    console.log("slidesObj: ", slidesObj)
    let template = slidesObj.type

    if (template == "T1") {
        // template1
        showTextSlides.value = true
        template789.value = false
    } else if (template == "T2") {
        // template2
        showTextSlides.value = true
        template789.value = false
    } else if (template == "T3") {
        // template3
        showTextSlides.value = true
        template789.value = false
    } else if (template == "T4") {
        // Dashboard
        mapParams1.value = slidesObj.OverviewMapParams
        mapParams2.value = slidesObj.SingleMapParams
        preselected.value = slidesObj.fire_id
        showDashboard.value = true
        template789.value = false
    } else if (template == "T5") {
        // SingleFire
        mapParams.value = slidesObj.mapParams
        preselected.value = slidesObj.fire_id
        showSingleFire.value = true
        template789.value = false
    } else if (template == "T6") {
        // SingleFire
        mapParams1.value = slidesObj.LeftMapParams
        mapParams2.value = slidesObj.RightMapParams
        preselected1.value = slidesObj.fire_id_left
        preselected2.value = slidesObj.fire_id_right
        showFireComparison.value = true
        template789.value = false
    } else if (template == "T7" || template == "T8" || template == "T9") {
        template789.value = true
    } else {
        throw "Error in displaySlides"
    }
}

function updateSlides(event) {
    let temp = parseInt(slideID.toString())
    if (event.keyCode === 39 && temp >= 0 && temp + 1 < slidesLength.value) {
        // press right key
        temp++
        router.push(`/slideseditor/${scriptID}/${temp}`)
    } else if (event.keyCode === 37 && temp - 1 >= 0) {
        temp--
        router.push(`/slideseditor/${scriptID}/${temp}`)
    } else if (event.keyCode === 27) {
        router.push("/storyeditor")
    }
}

// For "Save button"
const loading = ref(false)
const saveFile = () => {
    loading.value = true
    setTimeout(() => {
        loading.value = false
        // Copy the script in the Editor Store to the Story Store
        let newPresentation = useEditorStore.getcurrentPresentation()
        // Remove the mapParams object from slides
        newPresentation = useStoryStore.cleanParams(newPresentation)
        console.log(newPresentation)
        useStoryStore.script[scriptID].Presentation = newPresentation
        // Use Story store to Update the Story.json
        useStoryStore.UpdateFile()
        console.log("===Story.json UPDATED===")
    }, 1000)
    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Story Saved',
        life: 3000
    })
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
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    overflow-y: scroll;
}

#mode_switch {
    width: 100%;
    height: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
}

p {
    margin: 0 1rem;
}

.container {
    width: 100%;
    height: 100%;
}

#slidesEditorWindow {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

#slidesEditor-sidebar {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
}
</style>
