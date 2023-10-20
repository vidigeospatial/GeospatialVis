<template>
    <div id="stories">
        <div
            v-for="(card, index) in Cards"
            id="storiesCard-container"
            :key="index"
        >
            <StoryCard
                :story-card="card"
                @click="presentation(index)"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import StoryCard from "../Components/presenter/StoryCard.vue"
import { useStory } from '../../store/stories'
import router from "../../router/index"
import { onBeforeRouteLeave } from "vue-router"
import { onMounted } from "vue"

interface StoryCard {
    index: number,
    imgUrl: string,
    Title: string,
    Body: string,
    Tags: string
}

const useStoryStore = useStory()
const Cards: Array<StoryCard> = useStoryStore.getScript

function presentation (card_index){
    useStoryStore.updateCardIndex(card_index)
    useStoryStore.updateCurrentStory(card_index)
    router.push(`/slideshow/${card_index}/0`)
}

function exitEditor(event) {
    if (event.keyCode === 27) {
        router.push('/')
    }
}

onBeforeRouteLeave((to, from) => {
    document.removeEventListener("keyup", exitEditor)
})

onMounted(() => {
    document.addEventListener("keyup", exitEditor)
})

</script>

<style scoped>

#stories{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    overflow-y: scroll;
    height: 100%;
}

#storiesCard-container{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 30px;
    padding: 30px;
    height: fit-content;
}

</style>
