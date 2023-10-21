import { TileLayer } from '@deck.gl/geo-layers/typed'
import { BitmapLayer } from '@deck.gl/layers'
import { ImageLoader } from '@loaders.gl/images'
import { load, parse } from '@loaders.gl/core'
// import parseImage from '@loaders.gl/images/src/lib/parsers/parse-image'

import { VectorTile } from '@mapbox/vector-tile'
import Protobuf from 'pbf'

const options = {
    fetch: {
        method: 'GET',
        mode: 'cors',
    }
}

// function myParseImage(arrayBuffer: ArrayBuffer) {
//     // console.log("arrayBuffer", arrayBuffer)
//     return parseImage(arrayBuffer, { image: { type: 'data' } }).then(data => {
//     // return parseImage(arrayBuffer, {image: {type: 'imagebitmap'}}).then(data => {
//     // Fill the array with RGBA values
//         for (let i = 0; i < data.data.length; i += 4) {
//             // Modify pixel data
//             // data.data[i + 0] = 0; // R value
//             // data.data[i + 1] = 0; // G value
//             // data.data[i + 2] = 255; // B value
//             // data.data[i + 3] = 255; // A value
//         }

//         // console.log("data", data.data)
//         return data
//     })
// }

// const myImageLoader = {
//     ...ImageLoader,
//     options: null,
//     parse: myParseImage
// }
const fetchFunc = async (url, { layer, loaders, loadOptions, signal }) => {
    const response = await fetch(url, {
        signal,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
    })
    if (!response.ok) {
        // handle errors
    }
    console.log("response", response)

    return parse(response, loaders, loadOptions)
}

// class AggregatedTileLayer extends TileLayer {
//     updateState({ changeFlags }: UpdateParameters<this>) {
//         let { tileset } = this.state
//         // console.log("tileset", tileset)
//         const propsChanged = changeFlags.propsOrDataChanged || changeFlags.updateTriggersChanged
//         const dataChanged =
//       changeFlags.dataChanged ||
//       (changeFlags.updateTriggersChanged &&
//         (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getTileData))

//         if (!tileset) {
//             tileset = new this.props.TilesetClass(this._getTilesetOptions())
//             // console.log("content", tileset.content)
//             this.setState({ tileset })
//         } else if (propsChanged) {
//             tileset.setOptions(this._getTilesetOptions())

//             if (dataChanged) {
//                 // reload all tiles
//                 // use cached layers until new content is loaded
//                 tileset.reloadAll()
//             } else {
//                 // some render options changed, regenerate sub layers now
//                 this.state.tileset.tiles.forEach(tile => {
//                     tile.layers = null
//                 })
//             }
//         }

//         this._updateTileset()
//     }
// }
// AggregatedTileLayer.componentName = 'AggregatedTileLayer'


export class vueTileLayer {
    readonly url: string
    readonly attrs: any
    readonly name: string

    constructor(assignedURL?: string, assignedAttrs?: any, assignedName?: string) {
        if (assignedURL !== undefined) {
            this.url = assignedURL
        }
        this.attrs = assignedAttrs
        this.name = assignedName
    }

    private validateError(error: any): boolean {
    /* Handle Error Messages 502 etc. */
    //console.log("ERROR Message")
        return true
    }

    // myLoad(tileServerURL: string) {
    // // return load(tileServerURL).then(data => {
    //     return fetch(tileServerURL).then(data => parse(data, myImageLoader))
    // }

    create(visiblity: boolean, opacity: number = 0.3): any {
        // console.log(myImageLoader)
        const layer = new TileLayer({
        // const layer = new AggregatedTileLayer({
            // fetch: fetchFunc,
            layerName: this.name,
            id: this.name,
            // data: this.url,
            // loader: [options],
            loadOptions: {
                imagebitmap: {
                    // Flip the image vertically
                    imageOrientation: 'flipY'
                }
            },
            // loadOptions: {
            //   loader: [myImageLoader]
            // },
            getTileData: (tile) => {
                /* THE BUG is you need to guarantee that the URL for this tileLayer is unique */
                const { signal } = tile
                let { x, y, z } = tile.index
                const prefix = this.url
                const tileServerURL = prefix + `/${z}/${x}/${y}.png`

                //const data = fetch(tileServerURL, {signal}) //load
                //if(signal.aborted){
                //return null;
                //}
                let data = load(tileServerURL)
                // let data = this.myLoad(tileServerURL)
                return data
            },
            onTileError: error => this.validateError(error),
            minZoom: 0,
            maxZoom: 19,
            tileSize: 256,
            opacity: opacity,
            visible: visiblity,
            transparentColor: [0, 0, 0, 150],

            renderSubLayers: (props) => {
                const {
                    bbox: { west, south, east, north },
                } = props.tile
                // console.log("IN RENDER SUB LAYERS", props.data)
                return new BitmapLayer(props, {
                    data: null,
                    image: props.data,
                    bounds: [west, south, east, north],
                    // onClick: (info, event) => emit('click', { info, event }),
                })
            }
            ,
            ...this.attrs,
        })

        return layer
    }
}
