<template>
    <div class="fullscreen">
        <div class="mode_switch">
            <p>Preview</p>
            <InputSwitch v-model="EditMode" />
            <p>Edit</p>
        </div>
        <div class="container">
            <div class="card flex justify-content-center">
                <Listbox
                    v-model="selectedSlide"
                    :options="currentPresentation"
                    option-label="slideID"
                    class="w-full md:w-14rem"
                />
                <Listbox
                    v-model="selectedAction"
                    :options="actions"
                    option-label="name"
                    class="w-full md:w-14rem"
                />
            </div>
            <SlidesPreview
                :key="slideID"
                :all-presentation="currentPresentation"
            />
            <EditSlides
                v-if="EditMode"
                :key="slideID"
                :all-presentation="currentPresentation"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watch } from "vue"
import router from "../../router/index"
import { useStory } from "../../store/stories"
import { onBeforeRouteLeave, useRoute } from "vue-router"
import InputSwitch from "primevue/inputswitch"
import SlidesPreview from "../Components/presenter/SlidesPreview.vue"
import EditSlides from "../Components/presenter/EditSlide.vue"
import Listbox from "primevue/listbox"

const useStoryStore = useStory()
const route = useRoute()

// These will change over the course of the slideshow
let scriptID = parseInt(route.params.scriptID.toString())
let slideID = parseInt(route.params.slideID.toString())
useStoryStore.updateCardIndex(scriptID)
useStoryStore.updateSlideIndex(slideID)
useStoryStore.updateCurrentStory(scriptID)
useStoryStore.updateCurrentSlide(slideID)

const currentPresentation = ref(useStoryStore.getPresentation) // [slide1, slide2, slide3]
const slidesLength = ref(currentPresentation.value.length)

// toggle to Edit Mode
const EditMode = ref(false)

// TODO1: display the listbox and pop up the slide dynamically
// For ListBox
const selectedSlide = ref(currentPresentation.value[slideID])
watch(selectedSlide, () => {
    selectSlide()
})

function selectSlide() {
    console.log("selectedSlide: ", selectedSlide.value)
    console.log("new slideID: ",selectedSlide.value.slideID)
    
    slideID = selectedSlide.value.slideID
    useStoryStore.updateSlideIndex(slideID)
    useStoryStore.updateCurrentSlide(slideID)
    router.push(`/slideshow/${scriptID}/${slideID}`)
    // ERROR: cannot rerender the component
}

// TODO2: add "+" and "-" buttons to add/delete slides
const selectedAction = ref()
const actions = ref([
    { name: '+' },
    { name: '-' },
])
watch(selectedAction, ()=>{
    console.log("action: ", selectedAction.value.name)

    if (selectedAction.value.name == '+') {
        // create a copy of selectedSlide and update the slideID
        let newSlide = selectedSlide.value
        
        // Add a new slide
        useStoryStore.AddNewSlide({ ...newSlide })
        // Update slideID
        useStoryStore.UpdateSlideID()
    }
    // if action="-"
    else {
        let deletedSlide = selectedSlide.value
        selectedSlide.value = currentPresentation.value[0]
        // Update Store
        useStoryStore.DeleteSlide(deletedSlide)
        useStoryStore.UpdateSlideID()
    }
    // Update local variables
    currentPresentation.value = useStoryStore.getPresentation
    slidesLength.value = currentPresentation.value.length
    selectedSlide.value = currentPresentation.value[slideID]

})

// Use a watcher on the params to grab when the slides change
watch(
    () => route.params,
    (to, from) => {
        nextTick(() => {
            // Update the slideID and scriptID
            scriptID = parseInt(to.scriptID.toString())
            slideID = parseInt(to.slideID.toString())
            useStoryStore.updateCardIndex(scriptID)
            useStoryStore.updateSlideIndex(slideID)
            useStoryStore.updateCurrentStory(scriptID)
            useStoryStore.updateCurrentSlide(slideID)
            selectedSlide.value = currentPresentation.value[slideID]
        })
    }
)

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

.mode_switch {
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
}

p {
    margin: 5%;
}

.container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
}
</style>
