<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import router from "../../../router/index"
import { useStory } from '../../../store/stories'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

const ipcRenderer = window.require('electron').ipcRenderer

const props = defineProps<{
    allPresentation: any
}>()

const useStoryStore = useStory()
const route = useRoute()
let slideID = route.params.slideID

const presentations = props.allPresentation
const currentSlide = presentations[parseInt(slideID.toString())]

// For input value
const img_val = ref(null)
const text_val = ref(null)
const text_block_val = ref(null)
const img_left_val = ref(null)
const img_right_val = ref(null)

// For Input Boxes display
const oneImg = ref(true)
const needsTextBlock = ref(false)
loadInputBox()

function loadInputBox() {
    if (currentSlide.type == "T1") {
        oneImg.value = true
        needsTextBlock.value = false
    }
    else if (currentSlide.type == "T2") {
        oneImg.value = false
        needsTextBlock.value = false
    }
    else if (currentSlide.type == "T3") {
        oneImg.value = true
        needsTextBlock.value = true
    }
}

function updateContent() {
    let updatedSlide = currentSlide
    if (currentSlide.type == "T1") { // text + img
        console.log("updating T1")
        if (text_val.value != null) {
            updatedSlide.text = text_val.value

            if (img_val.value != null) {
                updatedSlide.img = img_val.value
            }
        }
        else if (currentSlide.type == "T2") { // text + img_left + img_right
            if (text_val.value != null) {
                updatedSlide.text = text_val.value
            }
            if (img_left_val.value != null) {
                updatedSlide.img_left = img_left_val.value
            }
            if (img_right_val.value != null) {
                updatedSlide.img_right = img_right_val.value
            }
        }
        else if (currentSlide.type == "T3") { // text + img + textBlock
            if (text_val.value != null) {
                updatedSlide.text = text_val.value
            }
            if (img_val.value != null) {
                updatedSlide.img = img_val.value
            }
            if (text_block_val.value != null) {
                updatedSlide.textBlock = text_block_val.value
            }
        }
        console.log("updatedSlide: ", updatedSlide)
        useStoryStore.updateJSON(updatedSlide)

    }
}

function exitSlides(event) {
    if (event.keyCode === 27) {
        router.push('/stories')
    }
}

function loadImage () {
    ipcRenderer.invoke('loadImage').then((result) => {
        img_val.value = result.replace(/^.*[\\\/]/, '')
    })
}

onMounted(() => {
    document.addEventListener("keyup", exitSlides)
})

onBeforeRouteLeave((to, from) => {
    document.removeEventListener("keyup", exitSlides)
})

</script>

<template>
    <div id="fullscreen">
        <div
            v-if="oneImg"
            class="card"
        >
            <label for="image">Image</label>
            <InputText
                id="image"
                v-model="img_val"
                aria-describedby="image-help"
            />
            <Button
                label="Pick Image"
                @click="loadImage"
            />
        </div>

        <div
            v-if="!oneImg"
            class="card"
        >
            <label for="image_left">Image Left</label>
            <InputText
                id="image"
                v-model="img_left_val"
                aria-describedby="image-help"
            />
        </div>

        <div
            v-if="!oneImg"
            class="card"
        >
            <label for="image_right">Image Right</label>
            <InputText
                id="image"
                v-model="img_right_val"
                aria-describedby="image-help"
            />
        </div>

        <div
            v-if="needsTextBlock"
            class="card"
        >
            <label for="textBlk">Text Block</label>
            <Textarea
                v-model="text_block_val"
                rows="5"
                cols="30"
            />
        </div>

        <div class="card">
            <label for="text">Text descriptioin</label>
            <Textarea
                v-model="text_val"
                rows="5"
                cols="30"
            />
        </div>

        <div
            id="button"
            class="card"
        >
            <Button
                label="Update"
                text
                raised
                @click="updateContent"
            />
        </div>
    </div>
</template>

<style scoped>
#fullscreen {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

label {
    color: black;
    margin: 5%
}

.card {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    margin: 2%;
}

#button {
    margin-top: 5%;
}
</style>