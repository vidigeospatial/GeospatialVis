<template>
    <div class="h-screen flex items-center justify-center text-black flex-col">
        <div class="text-5xl m-5 font-bold">
            Geospatial Data Demos (WIP)
        </div>
        <div class="mx-auto grid grid-cols-2">
            <PageCard
                v-for="card in cardData"
                :key="card.text"
                :text="card.text"
                :smalltext="card.smalltext"
                :link="card.link"
            />
        </div>
    </div>
</template>  

<script lang="ts" setup>
import PageCard from '@/views/Components/editor/ui/PageCard.vue'
let cardData = [
    {
        link: '/watercomparison',
        text: 'Two maps with CalSim output',
        smalltext: 'Data from James Gilbert (NOAA)'
    },
    {
        link: '/water',
        text: 'One map with CalSim output',
        smalltext: 'Data from James Gilbert (NOAA)'
    },
    {
        link: '/singlefire',
        text: 'Wildfire data',
        smalltext: 'Data from ?'
    }
]
</script>