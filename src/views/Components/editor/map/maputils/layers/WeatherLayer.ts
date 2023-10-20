import { SimpleMeshLayer } from '@deck.gl/mesh-layers'
import GL from '@luma.gl/constants'
import { useData } from '../../../../../../store/data'
import { OBJLoader } from '@loaders.gl/obj'
import ParticleLayer from './ParticleAdvection/particle-layer'

import * as d3 from "d3"

export class vueWeatherLayer {
    readonly useDataStore: any

    constructor() {
        this.useDataStore = useData()
    }
    
    // Make a wind layer with simple mesh arrows
    createWindLayer(visbility: boolean, fire_id: string): any {
        const windData = this.useDataStore.getData(fire_id, 'wind')[3]
        if (windData.weather_variables.length == 0){
            return undefined
        }

        let all_positions = []
        for (let i = 0; i < windData['gridPoints'][0].length; i ++) {
            let one_coordinate = [windData['gridPoints'][0][i], windData['gridPoints'][1][i]]
            all_positions.push(one_coordinate)
        }
        // This print windData so that I have a better view of what data I have
        //console.log(windData)
        // construct data, a list of maps
        let data = []
        let max_speed = 0
        for (let i = 0; i < all_positions.length; i ++) {
            let map_input = {}
            map_input["position"] = all_positions[i]
            map_input["angle"] = windData['grids']['wind_direction'][i]
            // map_input["color"] = [(-1) * 256 * Math.cos(map_input["angle"] * (Math.PI / 180)), (-1) * 256 * Math.cos((map_input["angle"] + 120) * (Math.PI / 180)), (-1) * 256 * Math.cos((map_input["angle"] - 120)* (Math.PI / 180))]
            map_input["color"] = [256 * Math.cos(map_input["angle"] * (Math.PI / 180)), 256 * Math.cos((map_input["angle"] + 120) * (Math.PI / 180)), 256 * Math.cos((map_input["angle"] - 120)* (Math.PI / 180))]
            map_input["speed"] = windData['grids']['wind_speed'][i]
            if (max_speed < Number(map_input["speed"])) {
                max_speed = Number(map_input["speed"])
            }
            data.push(map_input)
        }
        // Scaling the speed
        for (let i = 0; i < 270; i ++) {
            data[i]["speed"] = ((data[i]["speed"] / max_speed) * 500) + 100
        }
        return new SimpleMeshLayer({
            id: 'Wind_Arrows',
            data: data,
            mesh: 'https://raw.githubusercontent.com/yuya737/arrow_obj/main/Arrow5.obj',
            loaders: [OBJLoader],
            getPosition: d => d.position,
            getColor: d => [200, 200, 200, 255],
            getOrientation: d => [0, 90 + -1 * d.angle , 0],
            getScale: d => [d.speed, d.speed, d.speed],
            visible: visbility,
        })
    }

    createWindLayerParticle(visibility: boolean, fire_id: string): any {
        const windData = this.useDataStore.getData(fire_id, 'wind')[0]
        if (windData.weather_variables.length == 0){
            return undefined
        }
        let textureData = {
            width: windData.nGridX,
            height: windData.nGridY,
            data: [],
            type: GL.UNSIGNED_BYTE,
            format: GL.RGBA,
            dataFormat: GL.RGBA,
            parameters: {
                [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
                [GL.TEXTURE_MIN_FILTER]: GL.LINEAR
            },
            pixelStore: {
                [GL.UNPACK_FLIP_Y_WEBGL]: true
            },
        }
        console.log('windData', windData.grids.wind_direction)
        console.log('extent', d3.extent(windData.grids.wind_speed))

        const windScale = d3.scaleLinear().
            domain(d3.extent(windData.grids.wind_speed)).
            range([0.3, 1])

        for (let i = 0; i < windData.nGridX * windData.nGridY; i++) {
            let curWindScale = windScale(windData.grids.wind_speed[i])
            textureData.data.push(Math.sin(windData.grids.wind_direction[i] * (Math.PI / 180))*curWindScale*128+128)
            textureData.data.push(Math.cos(windData.grids.wind_direction[i] * (Math.PI / 180))*curWindScale*128+128)
            textureData.data.push(0)
            textureData.data.push(255)
        }

        textureData.data = new Uint8Array([...textureData.data])
        const bounds = [windData.bounds[0][0], windData.bounds[0][1], windData.bounds[2][0], windData.bounds[1][1]]
        console.log('bounds', bounds)
        console.log('textureData', textureData)

        let particleLayer = new ParticleLayer({
            id: 'wind_particle',
            visible: visibility,
            //image: wind_image,
            image: textureData,
            //image: wind_image2,

            //imageUnscale: [-128, 127],
            imageUnscale: [-50, 50],
            //bounds: [-180, -90, 180, 90],
            bounds: [windData.bounds[0][0], windData.bounds[0][1], windData.bounds[2][0], windData.bounds[1][1]],
            //bounds: bounds,
            numParticles: 500,
            maxAge: 40,
            speedFactor: 10,
            color: [0,0,0],
            width: 2,
            opacity: 0.1
        })
        return particleLayer
    }
}
