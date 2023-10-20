import { GeoJsonLayer } from '@deck.gl/layers'
import { useData } from '@/store/data'
import * as d3 from "d3"

export class vueGeoJsonLayer {
    readonly url: string
    readonly attrs: any
    readonly name: string

    data: any
    burnScale: any
    readonly useDataStore: any

    constructor(assignedURL?: string, assignedAttrs?: any, assignedName?: string, data?: any) {
        if (assignedURL !== undefined) {
            this.url = assignedURL
        }
        this.attrs = assignedAttrs
        this.name = assignedName
        this.data = data
        this.useDataStore = useData()
    }

    private validateError(error: any): void {
        /* Handle Error Messages 502 etc. */
    }

    create(visiblity: boolean, fireID: string = "PLACEHOLDER"): any {
        if (this.name == "OverviewClusters") {
            const formattedData = this.formatOverviewClustersGeoJSON()
            const layer = new GeoJsonLayer({
                id: this.name,
                data: formattedData,
                opacity: 0.75,
                visible: visiblity,
                pickable: true,
                getFillColor: d => {
                    let rgba = this.burnScale(Number(d['properties']['max'])).replace(/[^\d,]/g, '').split(',').map(d => Number(d))
                    rgba.push(255)
                    return rgba
                },
                onHover: (info) => {
                    console.log(info)
                },
                ...this.attrs,
            })
            return layer
        } else if (this.name == "Roads") {
            const data = this.useDataStore.getData(fireID, 'roads')
            this.data = data
            const formattedData = this.formatRoadsGeoJSON()
            const layer = new GeoJsonLayer({
                id: this.name,
                data: formattedData,
                visible: visiblity,
                // data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart.geo.json',
                // getWidth: d => 200,
                // getPath: d => d,
                getLineWidth: 100,
                getLineColor: [0, 0, 0, 155],
                parameters: {
                    depthTest: false,
                },
            })
            return layer
        } else {
            throw new Error("Layer name not recognized")
        }
    }

    //Hardcoded for GeoJSON Cluster, probably can be generalized
    formatOverviewClustersGeoJSON() {
        let featureCollection = {
            "type": 'FeatureCollection',
            "features": []
        }
        const maxAcreage = this.data.map(d => Number(d['max']))
        this.data.forEach(feature => {
            let geoFeature = {
                'type': 'Feature',
                "properties": {
                    'max': feature['max'],
                    'maxdate': feature['maxdate'],
                    'mindate': feature['mindate'],
                },
                "geometry": feature['hull']
            }
            featureCollection.features.push(geoFeature)
        })
        this.burnScale = d3.scaleLinear<string, number>().domain(d3.extent<number>(maxAcreage)).range(["white", "orange"])

        return featureCollection
    }

    formatRoadsGeoJSON() {
        let featureCollection = {
            "type": 'FeatureCollection',
            "features": []
        }
        let coordinatesList = []
        this.data.forEach(feature => {
            coordinatesList.push(feature['coordinates'][0])
        })

        let geoFeature = {
            "type": 'Feature',
            "geometry": {
                "type": 'MultiLineString',
                "coordinates": coordinatesList
            }
        }
        featureCollection.features.push(geoFeature)
        return featureCollection
    }
}
