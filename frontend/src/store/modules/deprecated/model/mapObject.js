export class MapObject {
    constructor(x,y, width, height, layerList) {
        this.x = x
        this.y = y
        this.height = height
        this.width = width
        this.layerList = layerList
    }

    getPosition(){
        return { "x":this.x, "y":this.y }
    }

    getDimensions(){
        return { "height":this.height, "width":this.width }
    }

    getLayerList(){
        return this.layerList
    }

    updateDimensionPosition(x , y , width, height, layerList){
        this.x = x
        this.y = y
        this.height = height
        this.width = width
        this.layerList = layerList
    }
}
