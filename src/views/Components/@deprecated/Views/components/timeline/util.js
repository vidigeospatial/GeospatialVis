import * as d3 from 'd3'

// converts degrees to radians
export function degToRad(deg) {
    return deg * Math.PI / 180
}

export function findCoordinateExtent(powerEntries) {
    let maxX = d3.max(powerEntries, powerEntry => powerEntry.longitude)

    let minX = d3.min(powerEntries, powerEntry => powerEntry.longitude)

    let maxY = d3.max(powerEntries, powerEntry => powerEntry.latitude)

    let minY = d3.min(powerEntries, powerEntry => powerEntry.latitude)

    return [minX, maxX, minY, maxY]
}