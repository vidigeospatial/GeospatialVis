<!-- components -->
<template>
    <!-- <div class="card" @click="presentation"> -->
    <div class="card">
        <header class="card__thumb">
            <a href="#"><img :src="imageSrc"></a>
        </header>
        <div class="card__body">
            <h2 class="card__title">
                <a href="#">{{ storyCard.Title }}</a>
            </h2>
            <div class="card__subtitle">
                {{ storyCard.Tags }}
            </div>
            <p class="card__description">
                {{ storyCard.Body }}
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineProps, computed } from 'vue'

const imageSrc = computed(() => new URL(`../../../assets/images/${props.storyCard.imgUrl}`, import.meta.url).href)

interface StoryCard {
    Title: string,
    Body: string,
    imgUrl: string,
    Tags: string
}

const props = defineProps<{
    storyCard: StoryCard //any
}>()

// function presentation (){
//     router.push('/slideshow')
// }

</script>

<style scoped>
@import url(http://fonts.googleapis.com/css?family=Open+Sans:400,700);
/* 
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
} */

body {
    font-family: "Open Sans";
    font-size: 17px;
    background-color: #eee;
}

/**
* CARD
**/

.card {
    position: relative;
    /* top: 50%;
    left: 50%;
    -webkit-transform: translateX(-50%) translateY(-50%) translateZ(0);
    transform: translateX(-50%) translateY(-50%) translateZ(0); */
    width: 400px;
    background-color: #fff;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    -webkit-transition: box-shadow 0.5s;
    transition: box-shadow 0.5s;
}

.card a {
    color: inherit;
    text-decoration: none;
}

.card:hover {
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.3);
}

/**
* THUMB
**/

.card__thumb {
    height: 245px;
    overflow: hidden;
    background-color: #000;
    -webkit-transition: height 0.5s;
    transition: height 0.5s;
}

.card__thumb img {
    width: 100%;
    display: block;
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
    -webkit-transition: opacity 0.5s, -webkit-transform 0.5s;
    transition: opacity 0.5s, -webkit-transform 0.5s;
    transition: opacity 0.5s, transform 0.5s;
    transition: opacity 0.5s, transform 0.5s, -webkit-transform 0.5s;
}

.card:hover .card__thumb {
    height: 130px;
}

.card:hover .card__thumb img {
    opacity: 0.6;
    -webkit-transform: scale(1.2);
    transform: scale(1.2);
}

/**
* card_BODY
**/

.card__body {
    position: relative;
    height: 185px;
    padding: 20px;
    -webkit-transition: height 0.5s;
    transition: height 0.5s;
}

.card:hover .card__body {
    height: 300px;
}

.card__title {
    margin: 0;
    padding: 0 0 10px 0;
    color: #000;
    font-size: 22px;
    font-weight: bold;
    text-transform: uppercase;
}
.card:hover .card__title{
    opacity: 0;
}

.card__subtitle {
    margin: 0;
    padding: 0 0 10px 0;
    font-size: 19px;
    color: coral;
}

.card:hover .card__subtitle{
    opacity: 0;
}

.card__description {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 56px;
    margin: 0;
    padding: 0;
    color: #666C74;
    line-height: 27px;
    opacity: 0;
    -webkit-transform: translateY(45px);
    transform: translateY(45px);
    -webkit-transition: opacity 0.3s, -webkit-transform 0.3s;
    transition: opacity 0.3s, -webkit-transform 0.3s;
    transition: opacity 0.3s, transform 0.3s;
    transition: opacity 0.3s, transform 0.3s, -webkit-transform 0.3s;
    -webkit-transition-delay: 0s;
    transition-delay: 0s;
}

.card:hover .card__description {
    opacity: 1;
    -webkit-transform: translateY(0px);
    transform: translateY(0px);
    -webkit-transition-delay: 0.2s;
    transition-delay: 0.2s;
}
</style>
