import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Pages/Home.vue'
import Intro from '../views/Pages/Intro.vue'
import Dashboard from '../views/Pages/Dashboard.vue'
import FireComparison from '../views/Pages/FireComparison.vue'
import WaterComparison from '../views/Pages/WaterComparison.vue'
import SingleFirePage from '../views/Pages/SingleFirePage.vue'
import Stories from '../views/Pages/Stories.vue'
import SmallMultiples from '../views/Components/editor/SmallMultiples.vue'
import Slideshow2 from '../views/Pages/Slideshow_temp.vue'
import WaterPage from '../views/Pages/SingleWaterPage.vue'
import Editor from '../views/Pages/SingleFireAddAnnotations.vue'
import Slideshow from '../views/Pages/Slideshow.vue'
import PageNotFound from '../views/Pages/PageNotFound.vue'
import Slideshow_yuya from '../views/Pages/Slideshow_temp.vue'
import StoryEditor from '../views/Components/editor/StoryEditor.vue'
import SlidesEditor from '../views/Components/editor/SlidesEditor.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
        // // component: Water
        // component: WaterComparison
    },
   // ,{
    //     path: '/demo',
    //     name: 'Demo',
    //     component: Dashboard
    // },
    // {
    //     path: '/fireComparison',
    //     name: 'FireComparison',
    //     component: FireComparison
    // },
    {
        path: '/singlefire',
        name: 'SingleFire',
        component: SingleFirePage
    },
    // {
    //     path: '/introduction',
    //     name: 'Intro',
    //     component: Intro
    // },
    // {
    //     path: '/stories',
    //     name: 'Stories',
    //     component: Stories
    // },
    // {
    //     path: '/slideshow/:scriptID/:slideID',
    //     name: 'Slideshow',
    //     component: Slideshow
    // },
    // // {
    // //     path: '/slides/:scriptID/:slideID',
    // //     component: Slideshow_yuya
    // // },
    {
        path: '/water',
        // component: WaterComparison
        component: WaterPage
    },
    {
        path: '/watercomparison',
        component: WaterComparison
    }
    // {
    //     path: '/editor',
    //     component: Editor
    // },
    // {
    //     path:'/storyeditor',
    //     component: StoryEditor
    // },
    // {
    //     path:'/slideseditor/:scriptID/:slideID',
    //     component: SlidesEditor
    // },
    // {
    //     path: '/:pathMatch(.*)*',
    //     component: PageNotFound
    // }
]
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})
export default router
