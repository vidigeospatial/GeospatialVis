import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import * as d3 from "d3"

export function GenerateSatel(data, stageName) {
    if (data.length === 0){
        return []
    }
    let maxpower = d3.max(d3.map(data, (a) => a.power))
    let result = []
    let parseInData = [...data]
    parseInData.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date)
    })

    for (let i = 0; i < parseInData.length; i++) {
        let radius_value = parseInData[i].power / maxpower * 25

        const layer = new HeatmapLayer({
            id: "heatmapLayer-satle" + stageName + "-" + i, 
            data: [parseInData[i]],
            getPosition: d => [d.longitude, d.latitude],
            getWeight: d => d.power / maxpower,
            // aggregation: 'SUM',
            radiusPixels: radius_value,
            // radiusPixels: 25
        })
        result.push(layer)
    }

    return result
}
