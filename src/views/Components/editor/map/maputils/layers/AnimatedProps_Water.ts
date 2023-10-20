import * as d3 from "d3"
import * as vsup from 'vsup'
import GL from '@luma.gl/constants'
import { useData } from '../../../../../../store/data'

import geometry from '@/assets/data/geometry.json'
import data from '@/assets/data/data.json'
import { faTable } from "@fortawesome/free-solid-svg-icons"

export class vueAnimatedProps {
    constructor(){

        // this.fireID = fireID
        // this.perimeter_data = []
        // this.frp_data = null
        // this.hasWindData = true

        // // Deal with perimeter
        // const perimeter_data = useData().getPerimeterData(fireID)
        // let perimeter_data_raw = this.standardizeTemporalResolution(perimeter_data, 12)
        // let size = perimeter_data_raw.length

        // // Assume that the data is chronologically ordered
        // this.timeScale = d3.scaleTime()
        //   .domain([new Date(perimeter_data_raw[0].perimeter_date),
        //     new Date(perimeter_data_raw[size-1].perimeter_date)])
        //   .range([0, 1])

        // // let start_time = new Date(perimeter_data_raw[0].perimeter_date)

        // // const areSameDay = (first, second) =>
        // //     first.getMonth() === second.getMonth() &&
        // //         first.getDay() === second.getDay();

        // perimeter_data_raw.slice(0, -1).forEach( (d,index) => {
        //   let date_obj = new Date(d.perimeter_date)

        //   this.perimeter_data.push({
        //     path: d.perimeter,
        //     startTime: this.timeScale(date_obj),
        //     endTime: this.timeScale(new Date(perimeter_data_raw[index + 1].perimeter_date)),
        //     timeString: date_obj.toLocaleString('ja-JP').slice(5, 9),
        //     time: date_obj
        //   })
        // })

        // this.smoothPerimeter(this.perimeter_data)
        // // this.calculateNormals(this.perimeter_data);
        // // this.calculateSpread(this.perimeter_data);

    // // Deal with FRP
    // const frp_data = useData().getData(fireID, 'frp')
    // // May not need to return a color scale
    // const [formatted_frp_data, frp_burnscale] = this.formattedHeatMapCollection(frp_data, this.timeScale)
    // this.frp_data = formatted_frp_data
    // // this.frp_burnscale = frp_burnscale
    // //
    // this.prepareWindParticleLayer()
    }

    // standardizeTemporalResolution(data, approx_gap_hours){
    //   // Assume that the data[0] exists
    //   let ret = [data[0]]
    //   let timeLastDump = data[0].perimeter_date
    //   data.forEach( element => {
    //     let sinceLastDump = new Date((new Date(element.perimeter_date) - new Date(timeLastDump))) / (1000 * 60 * 60)
    //     if (sinceLastDump * 0.9 > approx_gap_hours){
    //       ret.push(element)
    //       timeLastDump = element.perimeter_date
    //     }
    //   })
    //   return ret
    // }

    // smoothPerimeter(data){
    //   function wrapIndex(i, i_max) {
    //     let ret =  ((i % i_max) + i_max) % i_max
    //     return ret
    //   }
    //   // Save a copy
    //   let original = JSON.parse(JSON.stringify(data))

    //   // Iterate over perimeters
    //   for (let index = 0; index < data.length; index++) {
    //     let currentPerimeter = original[index].path
    //     data[index].smoothed_path = JSON.parse(JSON.stringify(original[index].path))

    //     currentPerimeter.pop()
    //     let temp = data[index].path.length / 1000
    //     let window = -1.66 * temp * temp + 20.02 * temp + 6.64
    //     window = parseInt(window)

    //     // Iterate over each perimeter
    //     for (let i = 0; i < currentPerimeter.length; i++){
    //       let x_temp = currentPerimeter[i][0]
    //       let y_temp = currentPerimeter[i][1]
    //       for (let j = 0; j < window; j++){
    //         x_temp += currentPerimeter[wrapIndex(i+j, currentPerimeter.length)][0]
    //         y_temp += currentPerimeter[wrapIndex(i+j, currentPerimeter.length)][1]

    //         x_temp += currentPerimeter[wrapIndex(i-j, currentPerimeter.length)][0]
    //         y_temp += currentPerimeter[wrapIndex(i-j, currentPerimeter.length)][1]
    //       }
    //       data[index].smoothed_path[i] = [x_temp / (window*2+1),  y_temp / (window*2+1)]
    //     }
    //     data[index].smoothed_path[data[index].smoothed_path.length-1] =
    //               data[index].smoothed_path[0]
    //   }
    // }

    // formattedHeatMapCollection(frp_data, timeScale){
    //   let heatmapdata = []
    //   // let colorScale = d3.scaleLinear().domain(d3.extent(frp_data.map(d=>d.power))).range(["white", "red"])
    //   // console.log("SDFSDF")
    //   let power_extent = d3.extent(frp_data.map(d=>parseFloat(d.power)))
    //   let vsupQuantization = vsup.quantization().branching(2).layers(4).valueDomain(power_extent).uncertaintyDomain([0,100])
    //   let vsupScale = vsup.scale().quantize(vsupQuantization).range(d3.interpolateReds)

    //   let colorScale_gridcell = d3.scaleLinear().domain(d3.extent(frp_data.map(d=>parseFloat(d.power)))).range(["white", "red"])
    //   let colorScale_gridcell_temp = d3.scaleLinear().domain(d3.extent(frp_data.map(d=>parseFloat(d.power)))).range([0,1])
    //   // let colorScale_gridcell = d3.interpolateReds().domain(d3.extent(frp_data.map(d=>parseFloat(d.power))));
    //   let a = d3.extent(frp_data.map(d=>d.power))
    //   // let colorScale_heatmap = d3.scaleLinear().domain(d3.extent(frp_data.map(d=>d.power))).range(["white", "red"])
    //   // let heatmap_min = d3.color("hsl(274, 35%, 55%)")
    //   // let heatmap_max = d3.color("hsl(274, 90%, 55%)")
    //   // let colorScale_heatmap = d3.interpolate(heatmap_min, heatmap_max)
    //   // let colorScale_heatmap = d3.scaleLinear().domain([0, 100]).range([hsl(274, 35%, 55%), hsl(274, 90%, 55%)])
    //   // let opacityScale = d3.scaleLinear().domain(d3.extent(frp_data.map(d=>d.processed_confidence))).range(0, 255)

    //   frp_data.forEach(feature =>{
    //     // let rgba_gridcell = vsupScale(parseFloat(feature.power), 100-parseFloat(feature.processed_confidence)).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
    //     // let rgba_gridcell = colorScale_gridcell(parseFloat(feature.power)).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
    //     let rgba_gridcell = d3.interpolateReds(colorScale_gridcell_temp(parseFloat(feature.power))).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
    //     // The range for processed_confidence is 0-100 conver to 0-1
    //     // let rgba_heatmap = colorScale_heatmap(feature.processed_confidence/100).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
    //     let rgba_heatmap = vsupScale(parseFloat(feature.power), 100-parseFloat(feature.processed_confidence)).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
    //     // console.log(rgba_heatmap)
    //     // let rgba_heatmap = colorScale_heatmap(feature["processed_confidence"]).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
    //     // let rgba = colorScale(parseFloat(feature["power"])).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
    //     // rgba.push(opacityScale(feature["processed_confidence"]))
    //     rgba_gridcell.push(255)
    //     rgba_heatmap.push(255)
    //     let data = {
    //       "coordinate" : [feature.centroid[0], feature.centroid[1]],
    //       "processed_confidence" : feature.processed_confidence,
    //       "power" : parseFloat(feature.power),
    //       "color_gridcell" : rgba_gridcell,
    //       "color_heatmap" : rgba_heatmap,
    //       "time" : timeScale(new Date(feature.date))
    //     }
    //     heatmapdata.push(data)
    //   })
    //   // return [heatmapdata, colorScale_gridcell]
    //   return [heatmapdata, colorScale_gridcell]
    // }

    // // private validateError(error: any): void{
    // validateError(error){

    // }

    // prepareWindParticleLayer(){
    //   const windData = useData().getData(this.fireID, 'wind')
    //   const numWindFields = windData.length
    //   const windFieldWidth = windData[0].nGridX
    //   const windFieldHeight = windData[0].nGridY

    //   // Need to remove this
    //   //
    //   /// //

    //   if (windData[0].weather_variables.length == 0){
    //     this.hasWindData = false
    //     return
    //   }
    //   let textureData = {
    //     width: windFieldWidth * numWindFields,
    //     height: windFieldHeight,
    //     data: [],
    //     type: GL.UNSIGNED_BYTE,
    //     format: GL.RGBA,
    //     dataFormat: GL.RGBA,
    //     parameters: {
    //       [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
    //       [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
    //     },
    //     pixelStore: {
    //       [GL.UNPACK_FLIP_Y_WEBGL]: true
    //     },
    //   }

    //   let textureDataTempHumidity = {
    //     width: windFieldWidth * numWindFields,
    //     height: windFieldHeight,
    //     data: [],
    //     type: GL.UNSIGNED_BYTE,
    //     format: GL.RGBA,
    //     dataFormat: GL.RGBA,
    //     parameters: {
    //       [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
    //       [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
    //     },
    //     pixelStore: {
    //       [GL.UNPACK_FLIP_Y_WEBGL]: true
    //     },
    //   }
    //   let allWindSpeed = []
    //   let allTemperature = []
    //   let allHumidity = []
    //   windData.forEach(d => {
    //     allWindSpeed = allWindSpeed.concat(d.grids.wind_speed)
    //     allTemperature = allTemperature.concat(d.grids.air_temp)
    //     allHumidity = allHumidity.concat(d.grids.relative_humidity)
    //   })

    //   console.log('extent', d3.extent(allWindSpeed))

    //   const windScale = d3.scaleLinear().
    //     domain(d3.extent(allWindSpeed)).
    //     range([0.3, 1])

    //   const temperatureScale = d3.scaleLinear().
    //     domain([20, 40]).
    //     range([0, 255])

    //   const humidityScale = d3.scaleLinear().
    //     domain([0, 100]).
    //     range([0, 255])

    //   // Make a 3D texture - but it's actually a 2D texture side by side
    //   // Just index inside the shader appropriately
    //   //
    //   // ____________________________________
    //   // |         |         |         |
    //   // |         |         |         |
    //   // |  Wind1  |  Wind2  |  Wind3  | ....
    //   // |         |         |         |
    //   // |_________|_________|_________|_____
    //   //

    //   for (let row = 0; row < windFieldHeight; row++) {
    //     for (let windFieldIndex = 0; windFieldIndex < numWindFields; windFieldIndex++){
    //       for (let col = 0; col < windFieldWidth; col++) {
    //         let index = row * windFieldWidth + col
    //         let curWindScale = windScale(windData[windFieldIndex].grids.wind_speed[index])
    //         // (r,g,b,a) = (wind_speed, wind_direction, 0, 255)
    //         textureData.data.push(Math.sin((windData[windFieldIndex].grids.wind_direction[index]) * (Math.PI / 180))*curWindScale*128+128)
    //         textureData.data.push(Math.cos((windData[windFieldIndex].grids.wind_direction[index]) * (Math.PI / 180))*curWindScale*128+128)
    //         // textureData.data.push(temperatureScale(windData[windFieldIndex].grids.air_temp[index]));
    //         textureData.data.push(0)
    //         textureData.data.push(255)

    //         textureDataTempHumidity.data.push(temperatureScale(windData[windFieldIndex].grids.air_temp[index]))
    //         textureDataTempHumidity.data.push(humidityScale(windData[windFieldIndex].grids.relative_humidity[index]))
    //         textureDataTempHumidity.data.push(0)
    //         textureDataTempHumidity.data.push(255)
    //       }
    //     }
    //   }

    //   /*
    //       for (let i = 0; i < windFieldIndexWidth * windFieldIndexHeight; i++) {
    //           let curWindScale = windScale(windData[windFieldIndex].grids.wind_speed[i]);
    //           textureData.data.push(Math.sin(windData[windFieldIndex].grids.wind_direction[i] * (Math.PI / 180))*curWindScale*128+128);
    //           textureData.data.push(Math.cos(windData[windFieldIndex].grids.wind_direction[i] * (Math.PI / 180))*curWindScale*128+128);
    //           textureData.data.push(0);
    //           textureData.data.push(255);
    //       }
    //       */
    //   textureData.data = new Uint8Array([...textureData.data])
    //   textureDataTempHumidity.data = new Uint8Array([...textureDataTempHumidity.data])
    //   const bounds = [windData[0].bounds[0][0], windData[0].bounds[0][1], windData[0].bounds[2][0], windData[0].bounds[1][1]]
    //   console.log('bounds', bounds)
    //   console.log('textureData', textureData)

    //   this.coolwarmReds = [
    //     0.2298057, 0.26623388, 0.30386891, 0.342804478, 0.38301334, 0.424369608, 0.46666708, 0.509635204,
    //     0.552953156, 0.596262162, 0.639176211, 0.681291281, 0.722193294, 0.761464949, 0.798691636, 0.833466556,
    //     0.865395197, 0.897787179, 0.924127593, 0.944468518, 0.958852946, 0.96732803, 0.969954137, 0.966811177,
    //     0.958003065, 0.943660866, 0.923944917, 0.89904617, 0.869186849, 0.834620542, 0.795631745, 0.752534934,
    //     0.705673158
    //   ]
    //   this.coolwarmBlues = [
    //     0.753683153, 0.801466763, 0.84495867, 0.883725899, 0.917387822, 0.945619588, 0.968154911, 0.98478814,
    //     0.995375608, 0.999836203, 0.998151185, 0.990363227, 0.976574709, 0.956945269, 0.931688648, 0.901068838,
    //     0.865395561, 0.820880546, 0.774508472, 0.726736146, 0.678007945, 0.628751763, 0.579375448, 0.530263762,
    //     0.481775914, 0.434243684, 0.387970225, 0.343229596, 0.300267182, 0.259301199, 0.220525627, 0.184115123,
    //     0.150232812

    //   ]
    //   this.coolwarmGreens = [
    //     0.298717966, 0.353094838, 0.406535296, 0.458757618, 0.50941904, 0.558148092, 0.604562568, 0.648280772,
    //     0.688929332, 0.726149107, 0.759599947, 0.788964712, 0.813952739, 0.834302879, 0.849786142, 0.860207984,
    //     0.86541021, 0.848937047, 0.827384882, 0.800927443, 0.769767752, 0.734132809, 0.694266682, 0.650421156,
    //     0.602842431, 0.551750968, 0.49730856, 0.439559467, 0.378313092, 0.312874446, 0.24128379, 0.157246067,
    //     0.01555616
    //   ]

    //   this.windParticleTextureData = textureData
    //   this.windParticleTextureDataTempHumidity = textureDataTempHumidity
    //   this.windParticleBounds = bounds
    // }

    getAnimatedProps(): any{
    type Coords = [number, number];
    let shapes: { [key: string]: Coords[] } = {}
    let textLayerProps = []
    let gridCellLayerProps = []
    
    const regex=/\(\((.*?)\)\)/
    geometry.forEach(
        (d: any) => {
            let shape: Coords[] = d.geometry.match(regex)[1].split(',').map((d: string) => d.trim().split(' ').map((d: string) => parseFloat(d)))
            shape.push(shape[0])
            shapes[d.Arc_ID] = shape
        }
    )
    let values = []
    data.forEach(
        d => values = values.concat(Object.entries(d).filter(([key, value]) => key.startsWith('C_')).map(d=>parseFloat(d[1])))
    )
    let cfs_extent = d3.extent(values)
    console.log(cfs_extent)

    let timeScale = d3.scaleTime()
        .range([0, 1])
        .domain([new Date(data[0]["A"]), new Date(data[data.length-1]["A"])])

    data.forEach(
        (d: any) => {
            for (const obj in d) {
                // If its a channell
                if (obj in shapes && obj.startsWith('C_')) {
                    gridCellLayerProps.push({
                        name: obj,
                        coordinates: shapes[obj][0],
                        value: parseFloat(d[obj]),
                        // color: d3.interpolateBlues().domain(cfs_extent).range(["white", "blue"])(parseFloat(data[0][obj])).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
                        color: d3.interpolateBlues(
                            d3.scaleLinear().domain(cfs_extent).range([0, 1])(parseFloat(d[obj]))
                        ).replace(/[^\d,]/g, '').split(',').map(d => Number(d)),
                        time: timeScale(new Date(d["A"])),
                        // time: 0,
                        confidence: 100
                    })
                }
            }

        }
    )
    let ret = {}
    // ret = { ...ret,
    //   'AnimatedGridCell': {
    //     id: 'Flow',
    //     data: gridCellLayerProps,
    //     extruded: true,
    //     pickable: true,
    //     getPosition: d => d.coordinates,
    //     getElevation: d => d.value,
    //     getFillColor: d => d.color,
    //     getTime: d => d.time,
    //     getConfidence: d => d.confidence,
    //     cellSize: 2000,
    //     elevationScale: 0.5,
    //     // parameters: {
    //     //   depthTest: false,
    //     // }
    //   }
    // }
    console.log(ret)
    return ret

        //   // Right now, the id of layer (before the underscore if there are more than one)
        //   // is tied directly to the layer toggle in TabMenu

        //   // For FRP
        //   // ret = {...ret,
        //   //     'AnimatedHeatmap': {
        //   //         id: 'Satellite_0',
        //   //         data: this.frp_data,
        //   //         getPosition: d => d.coordinate,
        //   //         // getWeight: d => 0,
        //   //         getWeight: d => d.processed_confidence / 100,
        //   //         radiusPixels: 40,
        //   //         aggregation: 'MEAN',
        //   //         // colorRange: [
        //   //         //     [255, 255, 255],
        //   //         //     [240, 240, 240],
        //   //         //     [217, 217, 217],
        //   //         //     [189, 189, 189]
        //   //         // ],
        //   //         colorRange: [
        //   //             [255, 247, 251],
        //   //             [236, 231, 242],
        //   //             [208, 209, 230],
        //   //             [166, 189, 219],
        //   //             [116, 169, 207],
        //   //             [54, 144, 192]
        //   //         ],

        //   //         // colorRange: [
        //   //         //     [255, 247, 243],
        //   //         //     [253, 224, 221],
        //   //         //     [252, 197, 192],
        //   //         //     [250, 159, 181],
        //   //         //     [247, 104, 161]
        //   //         // ],

        //   //         pickable: false,
        //   //     }

        //   // };

        //   // For AnimatedPath
        //   ret = { ...ret,
        //     'AnimatedPath': {
        //       id: 'Perimeter',
        //       data: this.perimeter_data,
        //       getWidth: d => 200,
        //       radiusPixels: 100,
        //       getColor: d => [255,0,0,255],
        //       positionFormat: `XY`,

        //       pointDuration: 0.05,

        //       getStartTime: d => d.startTime,
        //       getEndTime: d => d.endTime,
        //       getNorm: d => d.normals,
        //       getSpread: d => d.spread,

        //       pickable: true,

        //       parameters: {
        //         depthTest: false,
        //       }
        //     }

        //   }

        //   // Testing
        //   ret = { ...ret,
        //     'AnimatedGridCell': {
        //       id: 'Satellite_1',
        //       data: this.frp_data,
        //       getPosition: d => d.coordinate,
        //       getElevation: d => d.power,
        //       getFillColor: d => d.color_gridcell,
        //       getTime: d => d.time,
        //       getConfidence: d => parseFloat(d.processed_confidence),
        //       evalationScale: 100,
        //       cellSize: 400,
        //       parameters: {
        //         depthTest: true,
        //       },
        //       pickable: true,
        //     }
        //   }

        //   if (this.hasWindData){
        //     ret = { ...ret,
        //       'AnimatedWind': {
        //         id: 'Wind_Particle',
        //         // image: wind_image,
        //         image: this.windParticleTextureData,
        //         tempHumidityImage: this.windParticleTextureDataTempHumidity,
        //         coolwarmBlues: this.coolwarmBlues,
        //         coolwarmGreens: this.coolwarmGreens,
        //         coolwarmReds: this.coolwarmReds,
        //         // 0: No color (i.e. default), 1: Temperature, 2: Humidity
        //         colorSetting: 0.,

        //         // image: wind_image2,

        //         // imageUnscale: [-128, 127],
        //         imageUnscale: [-50, 50],
        //         // bounds: [-180, -90, 180, 90],
        //         bounds: this.windParticleBounds,
        //         // bounds: bouns,
        //         numParticles: 1000,
        //         maxAge: 10,
        //         speedFactor: 50,
        //         color: [0,0,0],
        //         width: 2,
        //         opacity: 1
        //       }
        //     }
        //   }

    }
}
