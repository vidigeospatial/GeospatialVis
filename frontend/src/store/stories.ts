import { defineStore } from 'pinia'
import { createPinia, setActivePinia, acceptHMRUpdate } from "pinia"
import { Story, Slide } from "@/types/storyTypes"
import _ from 'lodash'
const pinia = createPinia()
setActivePinia(pinia)

const ipcRenderer = window.require('electron').ipcRenderer

interface State {
    loaded: boolean
    script: Story[]
    activeStory: number
    activeSlide: number
    currentStory: Story
    currentSlide: Slide
}


export const useStory = () => {
    const innerStore = defineStore("dataStories", {
        state: (): State => ({
            loaded: false,
            script: [] as Story[],
            activeStory: 0, // storyID
            activeSlide: 0, // slideID
            currentStory: null as Story,
            currentSlide: null as Slide
        }),
        getters: {
            getScript: (state) => state.script,

            getStoryCard: (state) => state.currentStory,

            getAllPresentation(): Array<any> {
                let script = this.getScript
                const res: any[] = []
                for (let i = 0; i < script.length; i++) {
                    res.push(this.assignParams(script[i].Presentation))
                }
                return res
            },

            getCardindex: (state) => state.activeStory,

            getCurrentSlide: (state) => state.currentSlide
        },
        actions: {
            load() {
                let res = ipcRenderer.sendSync('getStories')
                // Modify the presentation to include mapParams
                this.script = JSON.parse(res)
                for (let i = 0; i < this.script.length; i++) {
                    this.script[i] = { ...this.script[i], Presentation: this.assignParams(this.script[i].Presentation) }
                }
                this.loaded = true
            },
            updateCardIndex(index) {
                this.activeStory = index
            },

            updateSlideIndex(index) {
                this.activeSlide = index
            },

            updateCurrentStory(scriptID) {
                this.currentStory = this.script[scriptID]
            },
            updateCurrentSlide(slideID) {
                this.currentSlide = this.currentStory[slideID]
            },

            // Update Stories.json in EditMode 
            updateStoryStore(inputSlide) {
                console.log("this.activeStory", this.activeStory)
                console.log("this.activeSlide", this.activeSlide)
                // update store
                this.script[this.activeStory].Presentation[this.activeSlide] = inputSlide
                this.currentStory = this.script[this.activeStory]
                this.currentSlide = this.script[this.activeStory].Presentation[this.activeSlide]
            },

            UpdateScript(newScript){
                this.script = newScript
            },

            UpdateFile(){
                ipcRenderer.invoke('writeStory', JSON.stringify(this.script))
                // ipcRenderer.invoke('writeStory', this.script)
            },

            assignParams(presentation) {
                let curMapID = 0
                let modifiedPresentation = presentation.map((item: any) => {
                    // } else if (item.type == "T4") {
                    if (item.type == "T4") {
                        item["OverviewMapParams"] = {
                            mapType: "overview",
                            mapID: curMapID.toString()
                        }
                        curMapID++
                        item["SingleMapParams"] = {
                            mapType: "single-fire",
                            mapID: curMapID.toString(),
                            annotations: item.annotations ? item.annotations : []
                        }
                        curMapID++
                    } else if (item.type == "T5") {
                        item["mapParams"] = {
                            mapType: "single-fire",
                            mapID: curMapID.toString(),
                            annotations: item.annotations ? item.annotations : []
                        }
                        curMapID++
                    } else if (item.type == "T6") {
                        item["LeftMapParams"] = {
                            mapType: "single-fire",
                            mapID: curMapID.toString(),
                            annotations: item.annotations_left ? item.annotations_left : []
                        }
                        curMapID++
                        item["RightMapParams"] = {
                            mapType: "single-fire",
                            mapID: curMapID.toString(),
                            annotations: item.annotations_right ? item.annotations_right : []
                        }
                        curMapID++
                    } else {
                        // console.log('sdf')
                    }
                    return item
                })
                return modifiedPresentation
            },

            // Assign params needed to render the slideshow
            cleanParams(presentation) {
                let modifiedPresentation = presentation.map((item: any) => {
                    // } else if (item.type == "T4") {
                    if (item.type == "T4") {
                        item = _.omit(item, 'OverviewMapParams')
                        item =_.omit(item, 'SingleMapParams')
                    } else if (item.type == "T5") {
                        item = _.omit(item, 'mapParams')
                    } else if (item.type == "T6") {
                        item = _.omit(item, 'LeftMapParams')
                        item = _.omit(item, 'RightMapParams')
                    } else { /* empty */ }
                    return item
                })
                return modifiedPresentation
            },
        }
    })
    const store = innerStore()
    if (!store.loaded) {
        store.load()
    }
    if (import.meta.hot) {
        import.meta.hot.accept(acceptHMRUpdate(useStory, import.meta.hot))
    } 
    console.log("store called", store)
    return store
}
