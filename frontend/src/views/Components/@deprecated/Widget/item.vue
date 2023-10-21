<template>
    <div class="item">
        {{ source.name }} _ {{ source.acres }} _ {{ source.fire_year }}
    </div>
</template>

<script>
export default {
    name: 'ItemComponent',
    props: {
        index: { 
            type: Number
        },
        source: {
            type: Object,
            default () {
                return {}
            }
        }
    }
}
</script>

<style scoped>
.item {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid lightgrey;
  /* padding: 1em; */
  text-align: right;
}
</style>