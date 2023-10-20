<template>
    <!-- <div  v-if="$apollo.queries.fireList.loading"> Insert Loading Animation...</div> -->
    <Main :fire-list="fireList" />
</template>

<script>
import gql from 'graphql-tag'
import Main from './Main.vue'

export default {
    components: {
        Main
    },
    data(){
        return {
            fireList: []
        }
    },
    // apollo: {
    //   fireList: {
    //     query: gql`query getFires {
    //       fire(where: {state: {_eq: "CA"}}) {
    //         name
    //         start_date
    //         acres
    //         centroid
    //         state
    //       }
    //     }`,
    //     update: data => data['fire']
    //   }
    // },
    computed: {
        triggerTop() {
            // return this.$store.offset * window.innerHeight; (DEPRECATED 4/15/21, Changed VUEX -> VUEX, PINIA, AXIOS)
        }
    } 
}
</script>