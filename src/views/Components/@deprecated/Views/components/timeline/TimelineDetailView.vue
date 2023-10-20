<template>
    <div
        id="verticalContainer"
        class="detailSlices"
        :style="{ width: width + '%', height: '100%' }"
    >
        <div
            :id="`perimeterMap-container-${pid}`"
            class="canvasMap"
        />
        <div
            id="interactions"
            class="interactionContainer"
        > 
            <b-button
                class="perimNav"
                variant="light"
                @click="GoEarly"
            >
                <i class="fas fa-arrow-left arrowStyle" />
            </b-button>
            <b-button
                class="perimNav"
                variant="light"
                @click="GoLater"
            >
                <i class="fas fa-arrow-right arrowStyle" />
            </b-button>
        </div>
    </div>
</template>
<script>
import * as THREE from "three"
import * as d3 from "d3"
import Stats from "stats.js"
import perimData from "../../../../assets/data/test_perimeter.json"
import powerData from "../../../../assets/data/test_power.json"
import Perimeter from "./perimeter.js"

export default {
    name: "TimelineDetailView",
    props: {
        pid: String,
        dataset: {
            type: Array,
            required: true,
        },
        height: Number,
        width: Number,
    },
    data () {
        return {
            perimeterS: [],
            globalS: null,
            renderer: null,
            sceneView: null,
            cameraView: null,
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
            zScaleFactor: 1,
            currData: [],
            addList: [],
            expendedList: [],
            isNinja: false,
            total_expand_perimeter: [],
            permiter_hover_expend: null,
            current_focus: 0,
        }
    },
    computed: {
        perimMeshes() {
            // stores all temporally different perimeters of a singular fire
            let firePerims = []

            let perimEntries = perimData.data.fire_perimeter
            let powerEntries =
        powerData.data.fire_avg_pow_and_conf_per_coord_per_hour

            for (let perimEntry of perimEntries) {
                var perim = new Perimeter(perimEntry)

                let perimPowerData = powerEntries.filter((powerEntry) => {
                    let powerDate = new Date(powerEntry.date_trunc)
                    let diffTime = perim.date - powerDate
                    let diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

                    return diffHours <= 6 && diffHours >= 0
                })

                perim.powerData = perimPowerData

                perim.init()
                firePerims.push(perim)
            }

            let mapOfSimilarFirePerims = this.omitSimilarParams(firePerims)
            return [
                mapOfSimilarFirePerims[0],
                mapOfSimilarFirePerims[1],
                mapOfSimilarFirePerims[2],
            ]
        },
        globalScale() {
            let globalMax = this.findGlobalMax(perimData.data.fire_perimeter)
            return 1 / globalMax
        },
    },
    watch: {
        dataset() {
            this.changeMap()
        },
    },
    mounted() {
        this.init()
    },

    methods: {
        init() {
            this.perimeterS = this.perimMeshes
            this.globalS = this.globalScale
            this.currData = [...this.perimeterS[2]]
            let container = document.getElementById(
                `perimeterMap-container-${this.pid}`
            )

            this.w = container.offsetWidth
            this.h = container.offsetHeight - 1
            this.aspect = this.w / this.h

            // scene
            const sceneView = new THREE.Scene()
            sceneView.background = 0xffffff
            this.sceneView = sceneView

            // stats
            this.stats = this.createStats()

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
            orthoCam.position.y = 0
            orthoCam.zoom = 1
            orthoCam.position.z = 10
            orthoCam.updateProjectionMatrix()
            this.cameraView = orthoCam
            this.sceneView.add(this.cameraView)

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
            // this.sceneView.add(hemLight)

            // directional light
            this.dirLight = new THREE.DirectionalLight(0xffffff, 1)
            this.dirLight.position.x = 0
            this.dirLight.position.y = this.cameraView.position.y
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

            this.sceneView.add(this.dirLight)
            this.currData.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date)
            })

            for (let perimeterInData of this.currData) {
                perimeterInData.scale.setScalar(this.globalS)
                let yPos = parseInt(
                    this.currData.indexOf(perimeterInData) * this.yScaleFactor
                )
                yPos = this.currData.indexOf(perimeterInData) * this.yScaleFactor * 0.5
                perimeterInData.position.set(0, yPos, 0)
                perimeterInData.updateFocusAction()
                this.sceneView.children.push(perimeterInData)
            }
            for (let i = 0; i < this.currData.length; i++) {
                this.currData[i].position.y = 9999
            }
            this.animate()
        },
        createStats() {
            let stats = new Stats()

            stats.setMode(0)

            stats.domElement.style.position = "absolute"
            stats.domElement.style.left = "0"
            stats.domElement.style.top = "0"

            return stats
        },
        animate() {
            requestAnimationFrame(this.animate)

            for (let perimeter of this.currData) {
                perimeter.animate()
            }

            this.render()
        },
        render() {
            this.renderer.render(this.sceneView, this.cameraView)
            this.stats.update()
        },
        unifiedPosition() {
            let result = []
            if (this.dataset.length == 0) {
                return result
            }
            let center = [
                this.currData[this.dataset[0]].centroidCoords[0],
                this.currData[this.dataset[0]].centroidCoords[1],
            ]
            for (let i = 0; i < this.dataset.length; i++) {
                let tempLoc = [
                    (this.currData[this.dataset[i]].centroidCoords[0] - center[0]) /
            center[0],
                    (this.currData[this.dataset[i]].centroidCoords[1] - center[1]) /
            center[1],
                ]
                result.push(tempLoc)
            }
            return result
        },
        changeMap() {
            this.currData.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date)
            })

            for (let perimeterInData of this.currData) {
                perimeterInData.position.y = 9999
            }

            let unifiedResult = this.unifiedPosition()
            for (let i = 0; i < this.dataset.length; i++) {
                this.currData[this.dataset[i]].position.x = unifiedResult[i][0]
                this.currData[this.dataset[i]].position.y = unifiedResult[i][1]
                this.currData[this.dataset[i]].position.z = -1 * i * 0.5
                if (i % 2 == 1) {
                    this.currData[this.dataset[i]].focusPerimeter(0x0000ff)
                } else {
                    this.currData[this.dataset[i]].focusPerimeter(0xff0000)
                }
            }
        },

        // exludes similar parameters (currently if change in acres is small)
        omitSimilarParams(firePerims) {
            let initalIndex = 0
            let similarToInitial = []
            let spliceList = []
            let mapOfSimilarFirePerims = new Map()

            for (let index = 1; index < firePerims.length; index++) {
                let element = firePerims[index]
                let prevElem = firePerims[index - 1]

                let hourDif =
          (element.date.getTime() - prevElem.date.getTime()) / 1000 / 60 / 60
                let acreDif =
          (Math.abs(prevElem.acres - element.acres) / prevElem.acres) * 100

                // if acre difference was < 10%
                if (acreDif < 30) {
                    // if hour difference was < 10
                    if (hourDif < 30) {
                        similarToInitial.push(element)
                        spliceList.push(element)
                        continue
                    }
                }
                if (similarToInitial.length > 0) {
                    similarToInitial.push(firePerims[initalIndex])
                    let middlePerims =
            similarToInitial[parseInt(similarToInitial.length / 2)]
                    similarToInitial.splice(similarToInitial.indexOf(middlePerims), 1)
                    spliceList.push(firePerims[initalIndex])
                    spliceList.splice(spliceList.indexOf(middlePerims), 1)
                    mapOfSimilarFirePerims.set(middlePerims, [...similarToInitial])
                }
                initalIndex = index
                similarToInitial = new Array()
            }

            let NewList = d3.filter(firePerims, (d) => {
                if (!spliceList.includes(d)) return d
            })

            return [[...NewList], new Map(mapOfSimilarFirePerims), [...firePerims]]
        },
        findGlobalMin(perimEntries) {
            let globalMin = Number.MAX_VALUE

            for (let perimEntry of perimEntries) {
                let polygons = perimEntry.perimeter.coordinates
                let centroid = perimEntry.centroid.coordinates
                for (let polygon of polygons) {
                    let min = d3.min(polygon, (d) => d3.min(d, (e) => e[0] - centroid[0]))
                    if (min < globalMin) globalMin = min
                }
            }
            return globalMin
        },
        findGlobalMax(perimEntries) {
            let globalMax = Number.MIN_VALUE

            for (let perimEntry of perimEntries) {
                let polygons = perimEntry.perimeter.coordinates
                let centroid = perimEntry.centroid.coordinates
                for (let polygon of polygons) {
                    let max = d3.max(polygon, (d) => d3.max(d, (e) => e[0] - centroid[0]))
                    if (max > globalMax) globalMax = max
                }
            }
            return globalMax
        },
        findRanges(perimEntries) {
            let globalMaxY = -Number.MAX_VALUE
            let globalMinY = Number.MAX_VALUE
            let globalMaxX = -Number.MAX_VALUE
            let globalMinX = Number.MAX_VALUE

            for (let perimEntry of perimEntries) {
                let polygons = perimEntry.perimeter.coordinates
                let centroid = perimEntry.centroid.coordinates
                for (let polygon of polygons) {
                    let maxY = d3.max(polygon, (d) => d3.max(d, (e) => 
                        e[0] // - centroid[0]
                    ))

                    let minY = d3.min(polygon, (d) => d3.min(d, (e) => e[0]))

                    let maxX = d3.max(polygon, (d) => d3.max(d, (e) => e[1]))

                    let minX = d3.min(polygon, (d) => d3.min(d, (e) => e[1]))

                    if (minY < globalMinY) globalMinY = minY
                    if (maxY > globalMaxY) globalMaxY = maxY
                    if (minX < globalMinX) globalMinX = minX
                    if (maxX > globalMaxX) globalMaxX = maxX
                }
            }
            return [globalMinY, globalMaxY, globalMinX, globalMaxX]
        },
        GoEarly() {
            if (this.current_focus > 0) {
                console.log("Go Early")
                this.current_focus -= 1
                // update
                let unifiedResult = this.unifiedPosition()
                this.currData[this.dataset[this.current_focus]].position.y =
          unifiedResult[this.current_focus][1]
            } else {
                console.log("Fail to Go Early")
            }
        },
        GoLater() {
            if (this.current_focus < this.dataset.length - 1) {
                console.log("Go Later")
                // update
                this.currData[this.dataset[this.current_focus]].position.y = 9999
                this.current_focus += 1
            } else {
                console.log("Fail to Go Later")
            }
        },
    },
}
</script>

<style scoped>
.canvasMap {
  width: 100%;
  height: 90%;
  margin: 0px;
  position: static; /* fixed or static */
  /* overflow: scroll; */
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* justify-content: center; */
  background-color: grey;
  height: 500px;
  width: 200px;
  position: absolute;
  left: 10%;
}

.detailSlices {
  border: black thin solid;
  border-right: none;
}
.arrow {
  border: solid black;
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 3px;
}

.arrowStyle{
  display: flex;
}

.perimNav{
  height:100%;
}

.interactionContainer{
  width: 100%;
  height: 10%;
}

.right {
  transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
}

.left {
  transform: rotate(135deg);
  -webkit-transform: rotate(135deg);
}
</style>
