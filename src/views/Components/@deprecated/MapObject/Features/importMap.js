import { PolygonLayer } from "@deck.gl/layers"
import * as d3 from "d3"

export function Generate(data) {
    console.log(data)
    if (data.length === 0){
        return []
    }
    let maxAcres = d3.max(d3.map(data, (a) => a.acres))
    console.log(maxAcres)
    let result = []
    let parseInData = [...data]
    parseInData.sort(function(a, b) {
        return new Date(b.perimeter_date) - new Date(a.perimeter_date)
    })

    for (let i = 0; i < parseInData.length; i++) {
        const layer = new PolygonLayer({
            id: "poly-layers-" + i, 
            data: [parseInData[i]],
            stroked: true,
            filled: false,
            extruded: false,
            wireframe: true,
            lineWidthMinPixels: 1,
            getPolygon: (d) => d.perimeter.coordinates[0],
            getLineColor: (d) => {
                console.log(d.acres/maxAcres * 200)
                return [d.acres/maxAcres * 200, 100, 200]
            },
            getLineWidth: 250,
        })
        result.push(layer)
    }

    return result
}
