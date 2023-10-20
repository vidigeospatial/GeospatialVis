<template>
    <div
        id="statusBar"
        class=""
        @mousedown="mouseDown"
        @click="mouseUp"
    >
        <button
            type="button"
            name="exit"
            class="exit"
            @click="closeMap"
        />
        <button
            type="button"
            name="fullscreen"
            class="fullscreen"
            @click="fullScreen"
        />
        <b-dropdown
            size="sm"
            text="Edit"
            class="editMenu"
            variant="transparent"
            toggle-class="MenuStyle"
        >
            <b-dropdown-item-button>Name</b-dropdown-item-button>
            <b-dropdown-item-button @click="triggerCleanScreen()">
                Clear Selection
            </b-dropdown-item-button>
        </b-dropdown>
        <b-dropdown
            v-if="!isAMap"
            size="sm"
            text="View"
            class="viewMenu"
            variant="transparent"
            toggle-class="MenuStyle"
        >
            <b-dropdown-item-button @click="triggerViewSelection('TimeLine')">
                Timeline
            </b-dropdown-item-button>
            <b-dropdown-item-button @click="triggerViewSelection('FireList')">
                FireList
            </b-dropdown-item-button>
            <b-dropdown-item-button @click="triggerViewSelection('HeatMap')">
                HeatMap
            </b-dropdown-item-button>
        </b-dropdown>
        <b-dropdown
            size="sm"
            text="Links"
            class="linkMenu"
            variant="transparent"
            toggle-class="MenuStyle"
        >
            <b-dropdown-item-button @click="triggerLinkSelection">
                Add Link
            </b-dropdown-item-button>
            <b-dropdown-item-button>Remove Link</b-dropdown-item-button>
        </b-dropdown>

        <button
            v-if="isAMap"
            type="button"
            name="layerButton"
            class="layerButton"
            variant="link"
            @click="toggleLayerTab"
        >
            <i class="fas fa-layer-group" />
        </button>
        <p class="objName">
            {{ mapID }}
        </p>
    </div>
</template>
<script>

export default {
    name: 'Status',
    props:{
        mapID: {
            type: String
        }
    },
    data(){
        return{
            name: "hello"
        }
    },
    computed:{
        isAMap(){
            console.log(this.mapID)
            return this.mapID.includes("map")
        }
    },
    mounted(){
    },
    methods: {
        mouseDown(){
            this.$emit("toggleDragOn")
        },
        mouseUp(){
            this.$emit("toggleDragOff")
        },
        closeMap(){
            this.$emit("closeMap")
        },
        fullScreen(){
            this.$emit("fullScreen")
        },
        triggerLinkSelection(){
            this.$emit("selectLinks")
        },
        triggerViewSelection(view){
            this.$emit('changeWidgetView', view)
        },
        triggerCleanScreen(){
            this.$emit('cleanScreen')
        },
        toggleLayerTab(){
            this.$emit("toggleLayers")
        }
    }

}
</script>
<style lang="css">
  button.MenuStyle{
    color: white;
  }

  button.MenuStyle:hover{
    color: #63ffea;
    text-decoration: none;
  }

</style>
<style lang="css" scoped>
p{
  color: black;
}

button {
    position: absolute;
}

.linkMenu{
  left: 20px;
  bottom: 19%;
  float: left;
}

.editMenu{
  left: 36px;
  bottom: 19%;
  float: left;
}

.viewMenu{
  left: 28px;
  bottom: 19%;
  float: left;
}

.objName{
  color: white;
  font-size: 90%;
}

.exit{
  left: 4px;
  top: 25%;
  border-radius: 50%;
  height: 12px;
  width: 12px;
  background-color: #cc4a4a;
  border: none;
}

button.layerButton{
  border: none;
  background: none;
  color: white;
  float: right;
  position: relative;
  margin: -0.25%;
}

button.layerButton:active{
  color: #63ffea;
}

button.exit:hover{
  background-color: #822424;
}

.fullscreen{
  left: 24px;
  top: 25%;
  border-radius: 50%;
  height: 12px;
  width: 12px;
  background-color: #609c2a;
  border: none;
}

button.fullscreen:hover{
  background-color: #2d881d;
}

#statusBar{
  width: 100%;
  background: #161e20;
  min-height: 24px;
  height: 3%;
  max-height: 3%;
  position: relative;
  top: 0;
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
  border: 1.5px solid;
  border-color: #161e20;
  border-bottom-color: #9d9d9d;
  border-bottom-width: 1px;
  left: -0.15px;
}
</style>
