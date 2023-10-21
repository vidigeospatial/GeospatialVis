<script lang="ts" setup>
import { onMounted, watch,ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Slide } from '@/types/storiesTypes'
import { nextPowOfTwo } from '@deck.gl/layers/typed/text-layer/utils'

// const props = defineProps<{
//     textSlidesParams: any
// }>()

// const textSlidesParams = props.textSlidesParams;

const props = defineProps<{
    allPresentation:  Slide[]
}>()
// let presentations = assignParams(props.allPresentation)

// get the slide index
const route = useRoute()
const image = ref(false)
let images = []

onMounted(() => {
    watch(props.allPresentation, (val) => {
        image.value = false
        nextTick(() => {
            let slideID = parseInt(route.params.slideID.toString())
            console.log("In TextSlides presentations: ", val)
            populateHTML(val[slideID])
            images = loadImage(val[slideID])
        })
    }, { immediate: true })

})

function populateHTML(slide: Slide){
    let text: string
    if (slide.footnote){
        text = `<h1> ${slide.header} </h1> <p> ${slide.body} </p>
                <small style='color: black'> ${slide.footnote} </small>`
    } else {
        text = `<h1> ${slide.header} </h1> <p> ${slide.body} </p>`
    }
    document.getElementById('text').innerHTML = text
    
}

function loadImage(slide: Slide){
    let ret = []
    // There's one image for T2
    if (slide.type == "T2"){
        image.value = true
        if (slide.extImg)
            ret.push(slide.imgSrc)
        else
            ret.push(new URL('../../assets/images/' + slide.imgSrc, import.meta.url).href)
    }

    if (slide.type == "T3"){
        image.value = true
        // There's two images for T3
        if (slide.extImg_right)
            ret.push(slide.imgSrc_left)
        else
            ret.push(new URL('../../assets/images/' + slide.imgSrc_left, import.meta.url).href)

        if (slide.extImg_right)
            ret.push(slide.imgSrc_right)
        else
            ret.push(new URL('../../assets/images/' + slide.imgSrc_right, import.meta.url).href)
    }
    return ret
}

</script>

<template>
    <div id="textslides-container">
        <div
            id="textslides-content"
            class="textslides-content"
        >
            <div
                id="text"
                class="textslides-item"
            />
            <img
                v-for="(imageSrc, index) in images"
                v-if="image"
                :key="index"
                class="textslides-item"
                :src="imageSrc"
            >
        </div>
    </div>
</template>

<style scoped>
#textslides-container {
    padding: 3%;
    height: 94%;
}

.textslides-content{
    display: grid;
    justify-content: center;
    align-items: center;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    grid-gap: 2rem;
    font-size: 2.5rem;
    height: 100%;
    width: 100%;
}
.textslides-content > img {
    justify-self: center;
    width: 80%;
    align-self: center;
}

.textslides-item:nth-child(1){
    grid-row-start: span 2;
}

.textslides-item:nth-child(1):last-child{
    grid-row-start: span 2;
    grid-column-start: span 2;
}
.textslides-item:nth-child(2):last-child{
    grid-row-start: span 2;
}

</style>
