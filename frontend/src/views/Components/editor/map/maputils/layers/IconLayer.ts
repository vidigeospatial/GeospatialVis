import { IconLayer } from '@deck.gl/layers'
import * as d3 from "d3"

const ICON_MAPPING = {
    marker: { x: 0, y: 0, width: 128, height: 128, mask: true }
}

export class vueIconLayer {
    readonly url: string
    readonly attrs: any
    readonly name: string

    data: any

    constructor(assignedURL?:string, assignedAttrs?:any,  assignedName?: string, data?:any){
        if(assignedURL !== undefined){
            this.url = assignedURL
        }
        this.attrs = assignedAttrs
        this.name = assignedName
        this.data = data
    }

    create(visiblity:boolean): any {
        const layer = new IconLayer({
            id: this.name,
            data: this.data,
            opacity: 0.75,
            visible: visiblity,
            pickable: true,
            iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
            iconMapping: ICON_MAPPING,
            getIcon: d => 'marker',

            sizeScale: 15,
            getPosition: d => d.coordinates,
            getSize: d => 5,
            getColor: d => [80, 140, 0],
            ...this.attrs,
        })
        return layer
    }
}

