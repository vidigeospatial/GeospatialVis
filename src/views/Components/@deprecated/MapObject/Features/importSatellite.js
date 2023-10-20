import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import * as d3 from "d3"

export function GenerateSatel(data) {
    console.log(data)
    if (data.length === 0){
        return []
    }
    let maxpower = d3.max(d3.map(data, (a) => {
        console.log(a)
        return a.power}))
    console.log(maxpower)
    let result = []
    let parseInData = [...data]
    parseInData.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date)
    })

    for (let i = 0; i < parseInData.length; i++) {
        const layer = new HeatmapLayer({
            id: "heatmapLayer-satle" + i, 
            data: [parseInData[i]],
            getPosition: d => [d.longitude, d.latitude],
            getWeight: d => d.power,
        })
        result.push(layer)
    }

    return result
}
