<template>
    <Menubar :model="items">
        <template #end> 
            <em>path (for debug)</em>: {{ path }} 
        </template>
    </Menubar>
</template>

<script setup lang="ts">
import Menubar from 'primevue/menubar'
import InputText from 'primevue/inputtext'
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
const route = useRoute()
const path = computed(() => route.path)
const items = ref([
    {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        to: '/'
    }
])
</script>

<style scoped>
</style>
