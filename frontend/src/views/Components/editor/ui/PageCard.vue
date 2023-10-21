<template>
    <div @click="flyTo" 
        class="no-underline block max-w-sm p-6 m-6  bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-700 dark:hover:bg-gray-600">
        <div class="mb-2 text-3xl font-bold tracking-tight text-gray-700 dark:text-white">{{ text || 'Default Text' }}</div>
        <p class="font-normal text-gray-700 dark:text-gray-400">{{ smalltext || 'Default Small Text' }}</p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    text: {
        type: String,
        default: 'Default Text'
    },
    smalltext: {
        type: String,
        default: 'Default Small Text'

    },
    link: {
        type: String,
        default: "/"
    }
})

import router from '@/router/index'

const flyTo = () => {
    router.push(props.link)
}

</script>