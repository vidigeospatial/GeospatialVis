import { PolygonLayer } from "@deck.gl/layers"
import * as d3 from "d3"

export function Generate(data, stageName) {
    if (data.length === 0){
        return []
    }
    let maxAcres = d3.max(d3.map(data, (a) => a.acres))
    let result = []
    let parseInData = [...data]
    parseInData.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date)
    })

    for (let i = 0; i < parseInData.length; i++) {
        const layer = new PolygonLayer({
            id: "poly-layers-" + stageName + "-" + i, 
            data: [parseInData[i]],
            stroked: true,
            filled: false,
            extruded: false,
            wireframe: true,
            lineWidthMinPixels: 1,
            getPolygon: (d) => d.perimCoords[0],
            getLineColor: (d) => [d.acres/maxAcres * 200, 100, 200],
            getLineWidth: 250,
        })
        result.push(layer)
    }

    return result
}
