import { defineStore } from 'pinia'

type FireDataBlock = {
    roads: any[];
    temperature: any[];
    humidity: any[];
    wind: any[];
    perimeter: any[];
    frp: any[];
    det: any[];
}

type WaterDataBlock = {
    unmetdemand: any[];
    groundwater: any[];
}


export const useData = defineStore('dataStore', {
    // Maps fire_id to data
    state: () => ({
        data: {} as Record<string, FireDataBlock | WaterDataBlock>
    }),
    actions: {
        createEntry(id: string): void{
            this.data[id] = {}
        },
        // Need to generalize this
        createFireData(fireID: string): void{
            this.data[fireID] =  {
                'roads': [],
                'temperature': [],
                'humidity': [],
                'wind': [],
                'perimeter': [],
                'frp': [],
                'det': []
            }
        },
        createWaterData(id: string): void{
            this.data[id] =  {
                'unmetdemand': {},
                'groundwater': {},
                'shapes': {}

            }
        },
        updateData( id: string, data: any, fieldName: string, dataType: string): void{
            if (this.data[id] == undefined){
                if (dataType == 'fire')
                    this.createFireData(id)
                else if (dataType == 'water')
                    this.createWaterData(id)
                else {
                    // raise error
                    console.log("Error: Invalid data type")
                }

            }
            this.data[id][fieldName] = data
        },
        getPerimeterData(fireID: string): any[]{
            return this.data[fireID]['perimeter']
        },
        getData(id: string, dataType: string): any[]{
            return this.data[id][dataType]
        }
    }
})
