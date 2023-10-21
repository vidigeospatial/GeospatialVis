<template>
    <div
        id="nav-container"
        class="nav-container"
    >
        <b-navbar
            toggleable="lg"
            type="light"
            variant="light"
        >
            <b-navbar-brand href="/">
                ViDi
            </b-navbar-brand>
            <b-navbar-toggle target="nav-collapse" />
            <b-navbar-nav>
                <b-nav-item-dropdown
                    class="menu-bar"
                    text="File"
                    left
                >
                    <b-dropdown-item
                        href="#"
                        @click="addMap()"
                    >
                        New Map
                    </b-dropdown-item>
                    <b-dropdown-item
                        href="#"
                        @click="addWidget()"
                    >
                        New Widget
                    </b-dropdown-item>
                    <b-dropdown-item
                        href="#"
                        @click="toggleSave()"
                    >
                        Save Layout
                    </b-dropdown-item>
                    <b-dropdown-item
                        href="#"
                        @click="toggleSaveAs()"
                    >
                        Save As New Layout
                    </b-dropdown-item>
                </b-nav-item-dropdown>

                <b-nav-item-dropdown
                    text="Edit"
                    left
                >
                    <b-dropdown-item
                        href="#"
                        @click="toggleModal()"
                    >
                        Link Manager
                    </b-dropdown-item>
                </b-nav-item-dropdown>

                <!-- read from DB profile and load in layouts -->
                <b-nav-item-dropdown
                    text="Layouts"
                    left
                >
                    <b-dropdown-item
                        v-for="layout in layouts"
                        :key="layout"
                        href="#"
                        @click="getLayoutofName(layout)"
                    >
                        {{ layout }}
                    </b-dropdown-item>
                </b-nav-item-dropdown>

                <b-nav-item href="/dev">
                    Playground
                </b-nav-item>
                <b-nav-item href="/about">
                    About
                </b-nav-item>
            </b-navbar-nav>

            <b-navbar-nav class="ml-auto">
                <b-nav-item id="title">
                    Default
                </b-nav-item>
                <b-nav-item
                    href="#"
                    @click="toggleLogin()"
                >
                    Login
                </b-nav-item>
            </b-navbar-nav>
        </b-navbar>
    </div>
</template>
<script>

export default {
    name:'NavMenu',
    components: {},
    data(){
        return {
            layouts: ["L1", "L2", "L3"],
            activeLayout: "Default",
            activeMapWidgetObject: [],
            savedObjectLinks: []
        }
    },
    computed: {
    // ...mapGetters({
    //   layoutsList: 'layouts/getTotalNumberOfLayouts'
    // }),
        layoutsListLength(){
            return  4 // this.layoutsList();
        }
    },
    watch:{
        layoutsListLength(newCount, oldCount){
            console.log(`We have ${newCount} layouts, previously ${oldCount}`)
            this.loadLayouts()
        }
    },
    created(){
    // console.log("navbar:", this.layoutsList());
        this.loadLayouts()
    },
    methods: {
        loadLayouts(){
            // this.layouts = this.$store.getters['layouts/getSavedLayouts']();
        },
        getLayoutofName(layoutName){
            // this.$store.commit("layouts/setActiveLayout", layoutName);
            // bus.$emit("loadLayout", layoutName);
            // this.updateActiveLayout(layoutName); 
        },
        updateActiveLayout(layoutName){
            // this.activeLayout = layoutName;
        },
        addMap(){
            // bus.$emit('addMap'); /* Send this to a BUS*/
        },
        addWidget(){
            // bus.$emit('addWidget');
        },
        toggleModal(){
            this.$bvModal.show('linkManager-modal')
        },
        toggleSave(){
            // check if the current layout has been saved and is not a Preset 
            // if the current layout is not then just continue with save 
            // else open up the Save As Modal
            if(this.activeLayout == "Default"){
                this.$bvModal.show('saveAs-modal')
            }else{
                // bus.$emit("saveLayout", this.activeLayout)
            }
        },
        toggleSaveAs(){
            this.$bvModal.show('saveAs-modal')
        },
        toggleLogin(){
            this.$bvModal.show('login-modal')
        },
        busListener(){
            bus.$on("updateMapsandWidgets", (Info) => {
                this.activeMapWidgetObject = [...Info]
            })
            bus.$on("updateSaveMapObjectLinks", (LinkInfo) => {
                this.savedObjectLinks = [...LinkInfo]
                console.log(this.savedObjectLinks)
            })
        }
    },
}
</script>
<style lang="css" scoped>
  .nav-container{
    max-height: 10%;
  }
</style>
