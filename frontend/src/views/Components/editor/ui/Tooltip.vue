<template>
    <div id="info-container">
        <div v-tooltip="description">
            <font-awesome-icon
                class="infoIcon"
                :icon="['fas', 'circle-info']"
                fixed-width
            />
        </div>
    </div>
</template>

<script>
export default {
    name: "Tooltip",
    props: {
        targetID: String,
        direction: String,
        description: String

    },
    data: () => ({}),
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    methods: {},

}
</script>

<style scoped>
.tooltipStyle {
    font-size: 0.5em;

}

.infoIcon {
    color: #b0b2b5;
    font-size: 0.65em;

}
</style>
