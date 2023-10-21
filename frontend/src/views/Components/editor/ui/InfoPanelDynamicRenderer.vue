<template>
    <div>
        <div
            v-for="(scheme, index) in schema"
            :key="index"
        >
            <KeepAlive>
                <component
                    :is="scheme.type"
                    v-if="index == props.selectedSchema"
                    :scheme="scheme"
                    @settings-changed="settingsChanged"
                />
            </KeepAlive>
        </div>
    </div>
</template>

<script setup lang="ts">

const emit = defineEmits(['settings-changed'])

const props = defineProps({
    schema: { type: Object, required: true },
    selectedSchema: { type: String, required: true }
})

const settingsChanged = (value) => {
    emit('settings-changed', value)
}

</script>

<style scoped>
</style>
