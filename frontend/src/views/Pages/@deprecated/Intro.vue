<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'

const router = useRouter()
// const slides = ["a","b","c","d","e"];
const slides = [
    /*
        */
    {
        'slideType': 1,
        'header': 'ECS 272 Final Project',
        'body': 'Exploring the Rim Fire using the Fire Behavior and Fire Modeling (FBFM) Data',
        'small': 'Yuya Kawakami'
    },
    {
        'slideType': 1,
        'header': 'Wildfire',
        'body': "'A large, destructive fire that spreads quickly over woodland or brush.'",
        'small': 'Oxford Languages',
        'img_src': 'https://i0.wp.com/calmatters.org/wp-content/uploads/2019/06/lede-art-for-fire-deck-e1553649234717.jpg?fit=1200%2C800&ssl=1' ,
        'ext': true
    },
    {
        'slideType': 1,
        'header': '$145,500,000,000',
        'body': 'Estimated economic footprint of Wildfires in California <em>alone</em> in 2018 (approx. 1.5% of GDP)',
        'small': 'Wang, D., Guan, D., Zhu, S. et al. Economic footprint of California wildfires in 2018. Nat Sustain'
    },
    {
        'slideType': 1,
        'header': '$2,450,000,000',
        'body': '5-year average for federal budget for wildfire management',
        'small': 'According to the 2021 Department of Interior Wildland Fire Management Report'
    },
    {
        'slideType': 0,
        'header': 'Wildfires cost many <em>lives</em> and a lot of <em>money</em> - both directly and indirectly',
        'body': '<b>Direct costs</b>: Lost lives, fire supression cost, loss of property, etc. <br> <b>Indirect costs</b>: Loss in tax revenue, loss in business revenue, etc.',
    },
    {
        'slideType': 1,
        'header': 'But... wildfires are <em>notoriously</em> hard to predict',
        'body': '"... wildfires are unpredictable events that often burn across multiple jurisdictions ..."',
        'img_src': "https://eoimages.gsfc.nasa.gov/images/imagerecords/81000/81919/Rim%20Fire_pho_2013233_lrg.jpg",
        'small': '2021 Department of Interior Wildland Fire Management Report',
        'ext': true
    },
    {
        'slideType': 1,
        'header': 'Thus... understanding <em>potential</em> fire behavior is critical in fire management',
        'body': '',
        'small': '(even if we can\'t fully predict it)'
    },
    {
        'slideType': 1,
        'header': 'Fire behavior models already exist!',
        'body': '<b>Scott and Burgan\'s Fire Behavior and Fire Modeling (FBFM)</b> work builds on Rothermel\'s seminal work in 1972 and Anderson\'s work in 1982, among others.',
        'small': 'Scott, Joe H. Standard fire behavior fuel models: a comprehensive set for use with Rothermel\'s surface fire spread model. US Department of Agriculture, Forest Service, Rocky Mountain Research Station, 2005.'
    },
    {
        'slideType': 1,
        'header': 'What\'s Scott and Burgan\'s FBFM40?',
        'body': '"40 Scott and Burgan Fire Behavior Fuel Model (FBFM40) represents distinct distributions of fuel loading found among surface fuel components (live and dead), size classes, and fuel types. This set contains more fuel models in every fuel type (grass, shrub, timber, slash) than Anderson\'s set of 13."',
        'small': 'https://www.landfire.gov/fbfm40.php'
    },
    {
        'slideType': 0,
        'header': 'Scott and Burgan\'s FBFM40 (cont.)',
        'body': 'Essentially... <b>model and assign</b> a fire behavior to each location in the United States based on it\'s environmental factors  (catagorical variable with 40 levels)',
    },
    {
        'slideType': 0,
        'header': 'Scott and Burgan\'s FBFM40 (cont.)',
        'body': 'Example of what the FBFM40 data looks like on the right. (They use 40 different colors with no obvious mapping of colors, so it\'s actually very difficult to discern each of the colors...)',
        'img_src': 'FBFMExample.png',
        'ext': false
    },
    {
        'slideType': 1,
        'header': 'The Rim Fire',
        'body': "Some Facts: August 17, 2013 - October 24, 2013. Recorded to be the third largest fire in California history. Suppression efforts alone cost <b>$127 million</b>. <br> The Rim Fire will be focus of our visualization.",
        'img_src': 'https://wildfiretoday.com/wp-content/uploads/2018/07/Rim-FergusonFires_7-28-2018.jpg',
        'small': 'July 2014 Rim Fire Recovery Update, United States Department of Agriculture',
        'ext': true
    },
    {
        'slideType': 0,
        'header': 'Data Overview',
        'body': "The main data that we have for the Rim Fire is a set of 88 time-varying <em>perimeters</em> of the fire. <br> At every time <em>t</em> we know the extent of the fire spread. <br> Shown on the right is the first perimeter recorded at 10:43AM on 8/19/2013.",
        'img_src': 't0.png',
        'ext': false
    },
    {
        'slideType': 1,
        'header': 'Visualization Goal',
        'body': "Our focus is on the spread of the fire - How can we understand <b>to where</b> and <b>how fast</b> the Rim Fire spread? <br> Furthermore, can FBFM40 provide insight into the Rim Fire\'s behavior?",
        'small': '(spoiler: yes!)'
    },
    {
        'slideType': 0,
        'header': 'Visualizing Perimeters',
        'body': 'On the right is the first perimeter (as seen before) rendered as a line around the fire region',
        'img_src': 'perimeter_nonsmooth.png',
        'ext': false
    },
    {
        'slideType': 0,
        'header': 'Smoothing',
        'body': 'To characterize <em>general</em> behavior, we apply smoothing of the perimeter. In practice this is just using a moving window and taking an average at every perimeter point. This becomes especially useful later in the time series when the perimeters become more messy. Shown on the right is the first perimeter (as seen before) but smoothed.',
        'img_src': 'perimeter_smooth.png',
        'ext': false
    },
    {
        'slideType': 1,
        'header': 'Visualizing Spread',
        'body': "We visualize spread in the similar way we understand tree rings - the distance between two perimeters encodes how much the fire spread between those two points in time.",
        'small': '(Data is processed such that two adjacent perimeters are approximately equally spaced temporally)',
        'img_src': 'spread_smooth.png',
        'ext': false
    },
    {
        'slideType': 0,
        'header': 'Roads',
        'body': "The role of roads in wildfires: <br> (1) Dictate where fire suppression personnel and efforts can readily reach. <br> (2): Act as a natural barrier since they carry no fuel load. (Scott \& Burgan 2005). As such, we can hypothesize that they play a role in the spread of the Rim Fire as well. Roads are presented with a red line as seen.",
        'img_src': 'roads.png',
        'ext': false
    },
    {
        'slideType': 0,
        'header': 'Let\'s take a look at the Rim Fire!',
        'body': 'Can we reason about its spread?'
    }

]

const index = ref(0)
    
function populateHTML(index){
    if (index < 0 || index >= slides.length) 
        return
    let text
    let { slideType } = slides[index]
    if (slideType == 0){
        text = `<h1> ${slides[index].header} </h1> <p> ${slides[index].body} </p>`
    } else if (slideType == 1){
        text = `<h1> ${slides[index].header} </h1> <p> ${slides[index].body} </p>
                    <small style='color: black'> ${slides[index].small} </small>`
    } else {
        throw 'Error in populateHTML'
    }

    document.getElementById('text').innerHTML = text
        
}

function loadImage(){
    if ('img_src' in slides[index.value]){
        if (slides[index.value].ext){
            return slides[index.value].img_src
        }
        return require('../../assets/images/' + slides[index.value].img_src)
    }
}

function navigateSlides(event){
    if(event.keyCode === 37 && index.value > 0){
        index.value--
    }else if(event.keyCode === 39  && index.value < slides.length){
        index.value++
    }else if(index.value === slides.length){
        console.log('adfasdff')
        router.push({ path: '/' })
    }
    populateHTML(index.value)
    console.log(index.value)
}

onBeforeRouteLeave((to, from) => {
    document.removeEventListener("keyup", navigateSlides)
})

onMounted(() => {
    document.addEventListener("keyup", navigateSlides )
    populateHTML(index.value)
})

</script>

<template>
    <div
        id="fullscreen"
        class="fullscreen"
    >
        <div
            id="content"
            class="content"
        >
            <img
                v-if="'img_src' in slides[index]"
                :src="loadImage()"
                :style="{'margin-left': '5vh', height: '45vh', float: 'right' }"
            >
            <div
                id="text"
                class="text"
            />
        </div>
    </div>
</template>

<style scoped>
.fullscreen{
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
}
.content{
    margin: 10vh;
    font-size: 2.5rem;
    &image {
        height: 40vh;
        margin: 0 2vh 2vh 2vh;
        float: right;
    }
}

</style>
