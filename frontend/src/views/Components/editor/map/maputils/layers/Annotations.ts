import LayersPass from '@deck.gl/core/typed/passes/layers-pass'
import { useMap } from '../../../../../../store/map'
import { MapState, LayerProp } from '@/types/mapTypes'

const ICON_MAPPING = {
    marker: { x: 128, y: 0, width: 128, height: 128, anchorY: 127 }
}
// Helper function to format a colored square
// const formatSVGSquare = (color) => `<svg width="1.25rem" height="1.25rem" > <rect width="1.25rem" height="1.25rem" fill="${color}";style="stroke-width:5;stroke:rgb(0,0,0)"/></svg>`;

export class vueAnnotationProps {

    readonly mapID: string
    readonly inverseTimeScale: any
    annotations: MapState.annotationData[]

    constructor(mapID: string, inverseTimeScale: any) {
        this.mapID = mapID
        this.inverseTimeScale = inverseTimeScale
    }

    getProps(annotationData: MapState.annotationData[]) : { [key: string]: LayerProp }  {

        let ret = {}
        // Add the Icons
        annotationData.forEach( (item, index) => {
            let name = 'Icons' + index.toString()
            // console.log(item.text)
            ret = { ...ret,
                [name]: {
                    id: name,
                    data: [{ location: item.location }],
                    iconAtlas: 'https://raw.githubusercontent.com/yuya737/assets/main/icon-atlas.png',
                    // iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
                    iconMapping: ICON_MAPPING,
                    getPosition: d => d.location,
                    getSize: d => 10,
                    getIcon: d => 'marker',
                    sizeScale: 4,

                    text: item.text,
                    relevantLayers: item.relevantLayers ? item.relevantLayers : [],
                    annotationID: item.id,
                    highlighted: item.highlighted ? item.highlighted : false,

                    time: this.inverseTimeScale(new Date(item.timestamp)),

                    pickable: true
                }
            }
        } )

        return ret
    }

}

