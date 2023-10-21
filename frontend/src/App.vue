<script lang="ts" setup>
// import NavBar from '@/views/Components/editor/ui/NavBar.vue'
import router from '@/router/index'

const goHome = () => {
    router.push('/')
}
</script>

<template>
    <div id="innerApp">
        <router-view />
        <div @click="goHome" class="fixed text-xl bottom-4 left-4 bg-transparent text-black hover:bg-gray-600 hover:text-white p-4 rounded-full cursor-pointer transition-all duration-300">
            Go Home
            <i class="pi pi-fw pi-home"></i>
        </div>
    </div>
</template>



<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Lato:wght@300;400&display=swap");
:root {
  --font: Roboto, sans-serif;
  --textColor: #374961;
  --linkActiveColor: #41b783;
}

.vsc-initialized {
  margin: 0;
}

.links {
  position: absolute;
  top: 15%;
  left: 3%;
}

.card{
  padding: 1rem;
}
#innerApp {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ffffff;
  height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  right: 0;
}
body {
  margin: 0;
}

h1 {
  color: black;
}
</style>
