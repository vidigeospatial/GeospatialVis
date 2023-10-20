<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import router from "../../../router/index"
import { useStory } from '../../../store/stories'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const props = defineProps<{
    allPresentation: any
}>()

// get all slides ==> [slide1, slide2, slide3]
let presentations = props.allPresentation

// get the slide index
const route = useRoute()
let slideID = parseInt(route.params.slideID.toString()) 
let currentSlide = presentations[slideID]

const oneImg = ref(true)
const needsTextBlock = ref(false)
let text: string
let textBlock: string

let images = loadImage()
const reload = ref(true)

watch(props.allPresentation, () => {
    // Runs when props.allP.. changes
    presentations = props.allPresentation
    currentSlide = presentations[parseInt(slideID.toString())]

    // Rerender
    reload.value = false
    nextTick(()=>{
        loadContent()
        reload.value = true
    })
    
})

if (currentSlide.type == "T8") {
    oneImg.value = false
}
if (currentSlide.type == "T9") {
    needsTextBlock.value = true
}

onMounted(() => {
    loadContent()
})

function loadContent() {
    
    let slidesObj = currentSlide
    text = slidesObj.text
    document.getElementById('text').innerHTML = text
    images = loadImage()

    if (currentSlide.type == "T7") { // template1
        oneImg.value = true
        needsTextBlock.value = false
    }
    else if (currentSlide.type == "T8") { // template2
        oneImg.value = false
        needsTextBlock.value = false
    }
    else if (currentSlide.type == "T9") { // template3
        oneImg.value = true
        needsTextBlock.value = true
        
        textBlock = slidesObj.textBlock
        document.getElementById('textblock').innerHTML = textBlock
    }
    else {
        throw 'Error in displaySlides'
    }
}

function loadImage() {
    let ret = []
    // There's one image for T1/T3
    if (currentSlide.type != "T8") {
        ret.push(new URL('../../../assets/images/' + currentSlide.img, import.meta.url).href)
    } else {
        // There's two images for T2
        ret.push(new URL('../../../assets/images/' + currentSlide.img_left, import.meta.url).href)
        ret.push(new URL('../../../assets/images/' + currentSlide.img_right, import.meta.url).href)
    }
    return ret
}
</script>

<template>
    <div id="fullscreen">
        <div class="imgBlock">
            <div
                v-if="reload"
                class="imgBlock"
            >
                <img
                    v-if="oneImg"
                    id="oneImg"
                    :src="images[0]"
                >
                <img
                    v-if="!oneImg"
                    :src="images[0]"
                    class="twoblocks"
                >
                <img
                    v-if="!oneImg"
                    class="twoblocks"
                    :src="images[1]"
                >
            </div>
            
            <div
                v-if="oneImg && needsTextBlock"
                id="textblock"
                class="twoblocks"
            >
                <p> {{ textBlock }}</p>
            </div>
        </div>

        <div id="text">
            <p> {{ text }}</p>
        </div>
    </div>
</template>

<style scoped>
#fullscreen {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
}

.imgBlock {
    width: 100%;
    height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    margin-bottom: 5%;
}

#oneImg {
    display: flex;
    width: 40%;
    height: auto;
}

.twoblocks {
    display: flex;
    width: 40%;
    margin: 5vh;
    justify-content: center;
}

#text {
    display: flex;
    font-size: 2rem;
    align-items: center;
    color: black;
}
p{
    margin: 5%;
}
#textblock {
    display: flex;
    font-size: 1rem;
    align-items: center;
    color: black;
}

</style>