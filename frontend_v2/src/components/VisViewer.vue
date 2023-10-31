<template>
    <div class="flex flex-col justify-center items-center w-100">
        <div>
            <h1 class="text-5xl font-bold text-white">
                Visualization Gallery
            </h1>
            <h1 class="text-xl text-white">
                VIDI Lab @ UC Davis
            </h1>
        </div>
        <VisCard
            v-for="card in cards"
            :key="card.title"
            :type="card.type"
            :title="card.title"
            :description="card.description"
            :footnote="card.footnote"
            :mediafootnote="card?.mediafootnote"
            :options="card?.options"
            :table="card?.table"
            :src="card.src"
        />
    </div>
</template>

<script setup lang="ts">
import VisCard from './VisCard.vue'
const cards = [
    {
        type: 'image',
        title: 'Unmet water demand at each CalSim Demand Unit, colored by severity',
        description: 'Static image of a visualization of demand units, indicating the severity of unmet water demand. The most severe regions in the south at this time step experiences ~100 TAF of unmet demand, for this climate scenario',
        footnote: 'Data from James Gilbert (NOAA)',
        src: 'unmetdemand.png'
    },

    {
        type: 'image',
        title: 'Unmet water demand at each CalSim Demand Unit, colored in comparison to historical baselines',
        description: 'Unmet water demand at each Calsim Demand Unit, in comparison to historical baselines. Since the difference is calculated as: <code> current_unmetdemand - baseline_unmetdemand </code>, negative values (more purple values) indicate larger unmet demand, in comparison to the historical baseline. <br> For this timestep, for this CalSim output, almost all demand units with the exception of some near the middle of the Central Valley experience <b> worse </b> water conditions, as indicated by the abundance of purple regions.',
        footnote: 'Data from James Gilbert (NOAA)',
        src: 'unmetdemand_comparison.png'
    },
    {
        type: 'image',
        title: 'HexTile and Icons',
        mediafootnote: 'Groundwater levels, unmet water demand, and the difference of unmet water demand with respect to the historical baseline',
        description: 'We are experimenting with a hexagonal tiling approach with icons for multivariate geospatial visualization. Multivariate geospatial visualization continues to be a challenge. The layered approach is a common way to deliver multivariate information (top figure), but when done naively, this introduces significant visual clutter. Here, we have three variables: (1) groundwater levels, (2) unmet water demand, and (3) difference of unmet water demand with respect to the historical baseline.' +
        '<br> Simple superimposition of these layers as seen in the top is ineffective, primarily due to the overreliance of colors, but also because grounwater data and water demand data use different spatial discretization.' + 
        '<br> By employing regular tiling (hexagons here) and icons, we can more effectively communicate multivariate data on maps.',
        footnote: 'Data from James Gilbert (NOAA)',
        src: 'hex.png'
    }, 
    {
        type: 'videos',
        title: 'Unmet water demand data as an animation over time',
        description:
         "Includes 7 CalSim outputs - <code> CS3_BL </code> is the historical baseline and the others are outputs for climate scenarios. The videos depict the difference in comparison to <code> CS3_BL </code> with the exception of <code> CS3_BL </code>.",
        table: [
            { name: "2023NAA_2022MED", description: "No-action alternative (NAA) from 2023 LTO using median 2022-centered hydrology" },
            { name: "2023NAA_2040MED", description: "No-action alternative (NAA) from 2023 LTO using median 2040-centered hydrology" },
            { name: "2023EXP1_2022MED", description: "Exploratory (EXP) scenario 1 from 2023 LTO using median 2022-centered hydrology" },
            { name: "2023Alt3_2022MED", description: "Alternative 3 from 2023 LTO using median 2022-centered hydrology"},
            { name: "2023Alt3_2040MED", description: "Alternative 3 from 2023 LTO using median 2040-centered hydrology"}

        ],
        footnote: 'Data from James Gilbert (NOAA)',
        src: "EO6u_IlShBo",
        options: [
            {
                title: 'Title',
                description: 'Description',
                name: "CS3_BL",
                src: "EO6u_IlShBo"
            },
            {
                title: 'Title',
                description: 'Description',
                name: 'bl_h000',
                src: "CLtyRqj-aZc"
            },
            {
                title: 'Title',
                description: 'Description',
                name: '2023Alt3_2022MED',
                src: "a6Rvb0_bocE"
            },
            {
                title: 'Title',
                description: 'Description',
                name: '2023Alt3_2040MED',
                src: "OYyLpP-bb58"
            },
            {
                title: 'Title',
                description: 'Description',
                name: '2023NAA_2040MED',
                src: "PTCGm80zeU0"
            },
            {
                title: 'Title',
                description: 'Description',
                name: '2023EXP1_2022MED',
                src: "rPK53GCskZ0"
            },
            {
                title: 'Title',
                description: 'Description',
                name: '2023NAA_2022MED',
                src: "awLGnUhuJMI"
            },
        ]
    },
    {
        type: 'image',
        title: 'Interactive annotations',
        description: 'We can rely on domain experts to provide supporting data or insights in the form of annotations on the map. This can dramatically increase effectiveness of communicating specific insights. We also support associated each annotation with specfic map layers, pertinent to that annotation.',
        footnote: '',
        src: 'img2.png'
    },
    {
        type: "videos",
        title: "California wildfire data example",
        description: "An example of visualizing wildfire data in California. For every fire, we have access to weather, wildfire perimeter, measured strength data and others. We implement an interactive layered approach to display time progression of past wildfires.",
        footnote: "",
        src: "j_8qF9omHzY"
    },

]
</script>