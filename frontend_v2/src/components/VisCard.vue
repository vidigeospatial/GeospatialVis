<template>
    <div
        class="my-4 shadow-md flex flex-col justify-center items-center bg-gray-300 border border-gray-300 rounded-lg shadow  w-5/6"
    >
        <img
            v-if="props.type === 'image'"
            class="w-5/6 pt-5"
            :src="getImgURL(props.src)"
            alt=""
        >
        <div class="pt-5">
            <LiteYouTubeEmbed
                v-if="props.type === 'videos'"
                :id="selected.src"
                title="Video"
            />
        </div>
        <Dropdown
            v-if="props.options"
            v-model="selected"
            :options="props.options"
            optionLabel="name"
            placeholder="Select a CalSim Output"
            class="text-black mt-4 h-auto w-auto md:w-14rem"
        />
        <p
            class="w-3/4 text-gray-900 text-sm m-0"
            v-html="props?.mediafootnote"
        />

        <div class="w-3/4">
            <h5 class="mb-2 text-3xl font-bold tracking-tight text-black ">
                {{ props.title }}
            </h5>
            <p
                class="mb-3 text-xl text-gray-900 "
                v-html="props.description"
            />
            <DataTable
                v-if="props.table"
                :value="props.table"
            >
                <Column
                    field="name"
                    header="Name"
                />
                <Column
                    field="description"
                    header="Description"
                />
            </DataTable>
            <p
                class="mb-3 text-gray-900 text-md "
                v-html="props.footnote"
            />
        </div>
        <!-- </div> -->
    <!-- </div> -->
    <!-- <div 
        v-if="props.type === 'videos'"
        class="bg-gray-300 border border-gray-200 rounded-lg shadow w-5/6 h-auto"
    > -->
        <!-- <div class="w-full flex flex-col justify-center items-center">
            <h5 class="mb-2 text-3xl font-bold tracking-tight text-gray-900 ">
                {{ props.title }}
            </h5>
            <p
                class="w-3/4 mb-3 text-xl text-gray-700 "
                v-html="props.description"
            />
            <p
                class="mb-3 text-gray-900 text-md "
                v-html="props.footnote"
            />
        </div> -->
    </div>
</template>

<script setup lang="ts">
import Dropdown from 'primevue/dropdown'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import LiteYouTubeEmbed from 'vue-lite-youtube-embed'
import 'vue-lite-youtube-embed/style.css'

const props = defineProps<{
    type: string,
    title: string,
    description: string,
    src: string,
    footnote: string,
    mediafootnote?: string,
    options?: {
        title: string,
        description: string,
        src: string
    }[],
    table?: {
        name: string,
        description: string
    }[]
}>()
import { ref, } from "vue"

const selected = ref(props.options ? { src: '' } : props)

function getImgURL(imageName: string) {
    console.log("imageName: " + imageName)
    // return new URL("/assets/" + imageName, import.meta.url).href
    return new URL(`../assets/images/${imageName}`, import.meta.url).href
    // if (imageName.length === 0) 
    //     return new URL("../../../../assets/images/" + "placeholder.jpeg", import.meta.url).href
    // else if (imageName.length > 0)
    //     return new URL("../../../../assets/images/layerIcons/" + imageName + ".png", import.meta.url).href
    // else
    //     return new URL("../../../../assets/images/images/" + imageName + ".png", import.meta.url).href
}
</script>

<style>
.yt-lite {
    width: 80vw;
    padding-top: 1.25rem;
}
.p-dropdown-items-wrapper {
    color: black
}
ul  {
  padding-left: 0;
}
ul li {
   list-style-position: inside;
}
</style>