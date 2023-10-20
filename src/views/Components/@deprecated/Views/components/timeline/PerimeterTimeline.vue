<template>
    <div
        id="slices"
        class="bucket"
        :style="{ width: width + '%', height: '100%' }"
    >
        <div
            id="dateContainer"
            class="dateContainerStyling"
        >
            <p
                id="dateDescription"
                class="dateTextStyling"
                :style="{fontSize: descripSize + 'em'}"
            >
                {{ dateString }}
            </p>
        </div>
        <div
            id="slicesWrapper"
            class="slicesWrapper"
        >
            <div
                id="slicesContainer"
                class="container"
            >
                <div
                    :id="`perimeter-container-${pid}`"
                    class="canvas"
                />
            </div>
        </div>
        <div id="expandContainer">
            <b-button
                v-show="isNinja"
                id="expand"
                pill
                size="sm"
                @click="Expand_Selection"
            >
                Expand
            </b-button>
        </div>
    </div>
</template>
<script>
import * as THREE from "three"
import * as d3 from "d3"
import Stats from "stats.js"

export default {
    name: "PerimeterTimeline",
    props: {
        pid: String,
        perimeterSample: Array,
        globalScale: Number,
        width: Number,
        height: Number,
        clear: Boolean
    },
    data () {
        return {
            renderer: null,
            scene: null,
            camera: null,
            dirLight: null,
            clock: new THREE.Clock(),
            cube: null,
            shapeGeom: null,
            mesh: null,
            mouse: new THREE.Vector2(-0, 0),
            w: 0,
            h: 0,
            aspect: 0,
            raycaster: new THREE.Raycaster(),
            hasFocus: false,
            stats: null,
            oldIntersects: [],
            hoveredPerimeter: null,
            camFrustrumVert: 1,
            originalCameraY: null,
            selected: [],
            intersects: [],
            clicked: false,
            clickedObject: null,
            expended: false,
            yScaleFactor: 1,
            currData: [...this.perimeterSample[2]],
            addList: [],
            expendedList: [],
            isNinja: false,
            total_expand_perimeter: [],
            permiter_hover_expend: null,
            dateString: "Hovered Perimeter Date",
            descripSize: 0.35
        }
    },
    watch: {
        hoveredPerimeter (val) {
            this.dateString = this.hoveredPerimeter.date // TODO: format the date to be readable (e.g., Currently: Thu Aug 22 2013 01:44:59 GMT-0700 (Pacific Daylight Time))
            if (this.perimeterSample[1].has(this.hoveredPerimeter)) {
                this.isNinja = true
                if (this.total_expand_perimeter.includes(this.hoveredPerimeter)) {
                    document.getElementById("expand").innerHTML = "-"
                } else {
                    document.getElementById("expand").innerHTML =
            "+" + this.perimeterSample[1].get(this.hoveredPerimeter).length
                }
            } else {
                this.isNinja = false
            }
        },
        expendedList (val) {
            for (let i of this.expendedList) {
                i.selectedColor(0x0000ff)
            }
        },
        width(){
            this.descripSize = (this.width / 300) * 0.35
        },
        clear(){
            if (this.selected.length == 0) {
                return
            }
            // Recover the color
            for (let i = 0; i < this.selected.length; i++){
                let targetPerimeter = this.currData[this.selected[i]]
                if (this.perimeterSample[1].has(targetPerimeter)) {
                    targetPerimeter.focusPerimeter(0x0000ff)
                    targetPerimeter.defocusPerimeter(0x0000ff)
                } else {
                    targetPerimeter.focusPerimeter(0xff0000)
                    targetPerimeter.defocusPerimeter(0x00ff00)
                }
            }
      
            // Clear up selected Perimeter
            this.selected = []
            this.$emit("selectedObj", [...this.selected])
            this.ReselectTarget()
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        ReadMe (event) {
            alert(
                "Current Version:\n\
      1. Use mouse scroll to target different map\n\
      2. Once the map is targeted, it will appear red or blue\n\
      3. Red is for 'no similar map later'\n\
      4. Blue is for 'collaps similar maps and open by click'\n\
      4a. Use click to expand the list with including the similar maps while targeting the blue map\n\
      4b. Then can keep scroll\n\
      4c. After the next click, the similar maps will collaps again\n\
      5. That said, first click on red map will be selected or removed from the List of Choosen\n\
      5a. Second click on the blue map in order to save or removed from the List of Choosen\n\
      5b. List of Choose is for future usage.\n\
      "
            )
        },
        init() {
            let container = document.getElementById(
                `perimeter-container-${this.pid}`
            )
            // TODO reenable
            container.addEventListener("click", this.onMouseClick, false)
            container.addEventListener("wheel", this.onMouseWheel)

            this.w = container.offsetWidth
            this.h = container.offsetHeight - 1
            this.aspect = this.w / this.h

            // scene
            const scene = new THREE.Scene()
            scene.background = 0xffffff
            this.scene = scene

            // stats
            // this.stats = this.createStats();

            // orthographic camera
            let orthoCam = new THREE.OrthographicCamera(
                -this.camFrustrumVert * this.aspect,
                this.camFrustrumVert * this.aspect,
                this.camFrustrumVert,
                -this.camFrustrumVert,
                0.1,
                1000
            )
            // TODO delete
            orthoCam.position.y = 6
            orthoCam.zoom = 0.2
            orthoCam.position.z = 10
            orthoCam.updateProjectionMatrix()
            this.camera = orthoCam
            this.scene.add(this.camera)

            // renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.w, this.h)
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
            this.renderer.shadowMap.renderReverseSided = false
            this.renderer.shadowMap.renderSingleSided = false
            container.appendChild(this.renderer.domElement)
            // container.appendChild(this.stats.domElement);

            // hull light
            let hemLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2)
            hemLight.position.set(0, 15, 5)
            // this.scene.add(hemLight)

            // directional light
            this.dirLight = new THREE.DirectionalLight(0xffffff, 1)
            this.dirLight.position.x = 0
            this.dirLight.position.y = this.camera.position.y
            this.dirLight.position.z = 10
            this.dirLight.shadow.camera.near = 0.001
            this.dirLight.shadow.camera.far = 50
            this.dirLight.shadow.mapSize.width = 4096
            this.dirLight.shadow.mapSize.height = 4096
            this.dirLight.shadow.camera.left = -40
            this.dirLight.shadow.camera.right = 40
            this.dirLight.shadow.camera.top = -40
            this.dirLight.shadow.camera.bottom = 40
            this.dirLight.castShadow = true
            this.dirLight.shadow.bias = -0.01

            this.scene.add(this.dirLight)

            this.currData.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date)
            })

            for (let i of Array.from(this.perimeterSample[1].keys())) {
                this.expendedList.push(i)
            }

            for (let perimeterInData of this.currData) {
                perimeterInData.scale.setScalar(this.globalScale)

                let yPos = parseInt(
                    this.currData.indexOf(perimeterInData) * this.yScaleFactor
                )
                yPos = this.currData.indexOf(perimeterInData) * this.yScaleFactor * 0.5

                perimeterInData.position.set(0, yPos, 0)
                perimeterInData.updateFocusAction()
                this.scene.add(perimeterInData)
            }

            let beginIndex = 0
            for (let i = 0; i < this.currData.length; i++) {
                if (!this.perimeterSample[0].includes(this.currData[i])) {
                    this.currData[i].position.y = 9999
                } else {
                    this.currData[i].position.y = parseInt(beginIndex)
                    this.currData[i].position.y = beginIndex * 0.5
                    beginIndex += 1
                }
            }
            this.animate()
        },
        animate() {
            requestAnimationFrame(this.animate)

            for (let perimeter of this.currData) {
                perimeter.animate()
            }

            this.render()
        },
        cleanUpExpandsion() {
            for (let i of this.perimeterSample[1].get(this.hoveredPerimeter)) {
                this.currData[this.currData.indexOf(i)].position.y = 9999
                i.selectedColor(0x00ff00)
                this.expendedList.splice(this.expendedList.indexOf(i), 1)
            }
        },
        updateExpandsion(parameter) {
            console.log("Start Expansion")

            this.expended = true

            let currentIndex = this.currData.indexOf(parameter) + 1
            this.addList = this.perimeterSample[1].get(parameter)
            for (let eachNewInput of this.addList) {
                this.expendedList.push(
                    this.currData[this.currData.indexOf(eachNewInput)]
                )
                this.currData[this.currData.indexOf(eachNewInput)].position.y =
          currentIndex * 0.5
                this.currData[this.currData.indexOf(eachNewInput)].selectedColor(
                    0x0000ff
                )
                currentIndex += 1
            }
        },
        render() {
            this.renderer.render(this.scene, this.camera)
            // this.stats.update();
        },
        onMouseWheel(event) {
            const amount = event.deltaY
            if (amount === 0) return
            const dis = amount / Math.abs(amount)
            let range = this.currData.filter((d) => d.position.y != 9999)
            let range_min = range.reduce(function (prev, curr) {
                return prev.position.y < curr.position.y ? prev : curr
            })
            let range_max = range.reduce(function (prev, curr) {
                return prev.position.y > curr.position.y ? prev : curr
            })
            this.camera.position.y += dis * 0.5
            if (this.camera.position.y > range_max.position.y) {
                this.camera.position.y = range_min.position.y
            } else if (this.camera.position.y < range_min.position.y) {
                this.camera.position.y = range_max.position.y
            }
            this.ReselectTarget()
        },
        onMouseClick() {
            this.clicked = true
            this.clickedObject = this.currData.indexOf(this.hoveredPerimeter)
            if (this.selected.length == 0) {
                this.selected.push(this.clickedObject)
            } else if (this.selected.includes(this.clickedObject)) {
                this.selected.splice(this.selected.indexOf(this.clickedObject), 1)
            } else {
                this.selected.push(this.clickedObject)
            }
            this.$emit("selectedObj", [...this.selected])
        },
        ReselectTarget() {
            this.currData.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date)
            })

            let range = this.currData.filter((d) => d.position.y != 9999)
            for (let i = 0; i < range.length; i++) {
                this.currData[this.currData.indexOf(range[i])].position.y = i * 0.5
            }

            let parameter = this.closestPerimeter()

            if (parameter != this.hoveredPerimeter) {
            }
            parameter.position.z = 9
            if (this.hoveredPerimeter != null) {
                this.hoveredPerimeter.position.z = 0
                if (
                    this.selected.includes(this.currData.indexOf(this.hoveredPerimeter))
                ) {
                    this.hoveredPerimeter.defocusPerimeter(0xffc0cb)
                } else if (this.expendedList.includes(this.hoveredPerimeter)) {
                    this.hoveredPerimeter.defocusPerimeter(0x0000ff)
                } else {
                    this.hoveredPerimeter.defocusPerimeter(0x00ff00)
                }
            }

            let indexing = range.indexOf(parameter)
            for (let i = 0; i < range.length; i++) {
                if (i < indexing) {
                    range[i].position.y -= 0.5
                } else if (i > indexing) {
                    range[i].position.y += 0.5
                }
            }

            this.hoveredPerimeter = parameter
            if (
                this.selected.includes(this.currData.indexOf(this.hoveredPerimeter))
            ) {
                this.hoveredPerimeter.focusPerimeter(0xffc0cb)
            } else if (this.perimeterSample[1].has(this.hoveredPerimeter)) {
                this.hoveredPerimeter.focusPerimeter(0x0000ff)
            } else {
                this.hoveredPerimeter.focusPerimeter(0xff0000)
            }
        },
        createStats() {
            let stats = new Stats()

            stats.setMode(0)

            stats.domElement.style.position = "absolute"
            stats.domElement.style.left = "0"
            stats.domElement.style.top = "0"

            return stats
        },
        closestPerimeter() {
            let range = this.currData.filter((d) => d.position.y != 9999)
            let range_min = range.reduce(function (prev, curr) {
                return prev.position.y < curr.position.y ? prev : curr
            })
            let range_max = range.reduce(function (prev, curr) {
                return prev.position.y > curr.position.y ? prev : curr
            })
            if (this.camera.position.y < range_min.position.y) {
                this.camera.position.y = range[0].position.y
                return range[0]
            } if (this.camera.position.y >= range_max.position.y) {
                this.camera.position.y = range[range.length - 1].position.y
                return range[range.length - 1]
            } 
            for (let i = 0; i < range.length; i++) {
                if (this.camera.position.y == range[i].position.y) {
                    return range[i]
                }
            }
      
        },
        Expand_Selection () {
            console.log("Expand Selection")

            if (document.getElementById("expand").innerHTML == "-") {
                this.cleanUpExpandsion()
                this.total_expand_perimeter.splice(
                    this.total_expand_perimeter.indexOf(this.hoveredPerimeter),
                    1
                )
                document.getElementById("expand").innerHTML =
          "+" + this.perimeterSample[1].get(this.hoveredPerimeter).length
                this.permiter_hover_expend = this.hoveredPerimeter
                this.ReselectTarget()
                var range = this.currData.filter((d) => d.position.y != 9999)
                var indexing = range.indexOf(this.hoveredPerimeter)
                for (var i = 0; i < range.length; i++) {
                    if (i < indexing) {
                        range[i].position.y += 0.5
                    } else if (i > indexing) {
                        range[i].position.y -= 0.5
                    }
                }
                this.camera.position.y = this.permiter_hover_expend.position.y
            } else {
                this.updateExpandsion(this.hoveredPerimeter)
                this.total_expand_perimeter.push(this.hoveredPerimeter)
                document.getElementById("expand").innerHTML = "-"
                this.permiter_hover_expend = this.hoveredPerimeter
                this.ReselectTarget()
                var range = this.currData.filter((d) => d.position.y != 9999)
                var indexing = range.indexOf(this.hoveredPerimeter)
                for (var i = 0; i < range.length; i++) {
                    if (i < indexing) {
                        range[i].position.y += 0.5
                    } else if (i > indexing) {
                        range[i].position.y -= 0.5
                    }
                }
                this.camera.position.y = this.permiter_hover_expend.position.y
            }

            this.ReselectTarget()
        },
    },
}
</script>

<style scoped>
.canvas {
  width: 100%; /*200px;*/
  height: 100%; /*1000px;*/
  position: static; /* fixed or static */
  /* overflow: scroll; */
}
.container {
  /* display: flex;
  flex-direction: column;
  align-items: center; */
  height: 80%;
  width: 100%;
  border-bottom: black thin solid;
  background-color: white;
}
.bucket {
  border: black thin solid;
  position: relative;
  background-color: black;
}

.slicesWrapper {
  width: 100%;
  height: 100%;
}

.dateContainerStyling {
  width: 100%;
  margin: 0 auto;
  display: inline-block;
  overflow: hidden;
}

.dateTextStyling{
  word-wrap: break-word;
  word-break: break-all;
  color: rgb(173, 164, 164);
}

#dateContainer {
  position: absolute;
  word-wrap: break-word;
  word-break: break-all;
  top: 78%;
  left: 0;
  padding: 10%;
}

#expandContainer {
  position: relative;
  bottom: 8%;
  left: 0;
}
</style>
