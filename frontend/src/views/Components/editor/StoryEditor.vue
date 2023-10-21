<template>
    <!-- <div id="fullscreen"> -->
    <div id="stories-container">
        <Splitter
            style="height: 100%"
        >
            <SplitterPanel
                :size="50"
            >
                <div
                    v-if="loadCards"
                    id="stories"
                >
                    <div
                        v-for="(card, index) in Cards"
                        :key="index"
                        class="storiesCard-container"
                    >
                        <StoryCard
                            :storyCard="card"
                            @click="presentation(index)"
                        />
                    </div>
                </div>
            </SplitterPanel>
            <SplitterPanel
                style="display: flex; flex-direction: row; justify-content: center; align-items: center;"
            >
                <!-- Input boxes for adding New Story-->
                <div class="Card flex flex-wrap gap-3 justify-content-center padding">
                    <span class="p-float-label">
                        <Textarea
                            v-model="imgUrl"
                            rows="1"
                            cols="25"
                        />
                        <Button
                            label="Pick Image"
                            @click="loadImage"
                        />
                        <label>imgUrl</label>
                    </span>
                    <span class="p-float-label">
                        <Textarea
                            v-model="Title"
                            rows="1"
                            cols="25"
                        />
                        <label>Title</label>
                    </span>
                    <span class="p-float-label">
                        <Textarea
                            v-model="Body"
                            rows="1"
                            cols="25"
                        />
                        <label>Body</label>
                    </span>
                    <span class="p-float-label">
                        <Textarea
                            v-model="Tags"
                            rows="1"
                            cols="25"
                        />
                        <label>Tags</label>
                    </span>
                    <Button
                        label="Add a new story"
                        severity="secondary"
                        rounded
                        @click="AddStories()"
                    />
                </div>
            </SplitterPanel>
        </Splitter>
    </div>

    <!-- </div> -->
</template>

<script lang="ts" setup>
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import StoryCard from "@/views/Components/presenter/StoryCard.vue"
import { useStory } from "@/store/stories"
import router from "@/router/index"
import { onBeforeRouteLeave } from "vue-router"
import { onMounted, ref, watch, computed } from "vue"
import Button from "primevue/button"
import Textarea from "primevue/textarea"
import { useEditor } from "@/store/editor"
const ipcRenderer = window.require('electron').ipcRenderer
import { Story } from "@/types/storiesTypes"

const useStoryStore = useStory()
const useEditorStore = useEditor()
const Cards = computed(() => useStoryStore.script)   
const loadCards = ref(true)

const imgUrl = ref("")
const Title = ref("")
const Body = ref("")
const Tags = ref("")

// Rerender the page to show the new story

function loadImage () {
    ipcRenderer.invoke('loadImage').then((result) => {
        imgUrl.value = result.replace(/^.*[\\\/]/, '')
    })
}

function presentation(card_index) {
    // useStoryStore.updateCardIndex(card_index)
    // useStoryStore.updateCurrentStory(card_index)
    router.push(`/slideseditor/${card_index}/0`)
}

function exitEditor(event) {
    if (event.keyCode === 27) {
        router.push("/")
    }
}

function AddStories() {
    // use editor store to push a new story
    // get the index of the new story
    let newScript = useStoryStore.getScript
    let newStory: Story = {
        imgUrl: imgUrl.value,
        Title: Title.value,
        Body: Body.value,
        Presentation: [
            {
                "type": "T1",
                "header": "Your new story",
                "body": "",
                "footnote": ""
            }
        ],
        Tags: Tags.value
    }
    newScript = [...newScript, newStory]
    useStoryStore.UpdateScript(newScript)

    imgUrl.value = ""
    Title.value = ""
    Body.value = ""
    Tags.value = ""

    // useEditorStore.addStory(
    //     imgUrl.value,
    //     Title.value,
    //     Body.value,
    //     Tags.value
    // )

    // console.log("script: ", script.value);
    // router.push(`/slideseditor/${storyID}/0`);
}

onBeforeRouteLeave((to, from) => {
    document.removeEventListener("keyup", exitEditor)
})

onMounted(() => {
    document.addEventListener("keyup", exitEditor)
})
</script>

<style scoped>
#fullscreen {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    overflow-y: scroll;
}

#stories {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    overflow-y: scroll;
}

.storiesCard-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    height: fit-content;
    padding: 30px;
    overflow-y: scroll;
}

.card {
    /* position: relative; */
    /* top: 50%;
    left: 50%; */
    display: flex;
    flex-direction: column;
    /* justify-content: space-between; */
    /* -webkit-transform: translateX(-50%) translateY(-50%) translateZ(0);
    transform: translateX(-50%) translateY(-50%) translateZ(0); */
    width: 400px;
    background-color: #fff;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    -webkit-transition: box-shadow 0.5s;
    transition: box-shadow 0.5s;
}

#stories-container{
    width: 100%;
    height: 100%;
}

#stories{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    overflow-y: scroll;
    height: 100%;
}

</style>
