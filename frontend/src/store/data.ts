import { defineStore } from 'pinia'

type DataBlock = {
    roads: any[];
    temperature: any[];
    humidity: any[];
    wind: any[];
    perimeter: any[];
    frp: any[];
    det: any[];
}

export const useData = defineStore('dataStore', {
    // Maps fire_id to data
    state: () => ({
        data: {} as Record<string, DataBlock>
    }),
    actions: {
        createFireData(fire_id: string): void{
            this.data[fire_id] =  {
                'roads': [],
                'temperature': [],
                'humidity': [],
                'wind': [],
                'perimeter': [],
                'frp': [],
                'det': []
            }
        },
        updateFireData( fire_id: string, data: Array<any>, data_type: string): void{
            if (this.data[fire_id] == undefined){
                this.createFireData(fire_id)
            }
            this.data[fire_id][data_type] = data
        },
        getPerimeterData(fire_id: string): any[]{
            return this.data[fire_id]['perimeter']
        },
        getData(fire_id: string, data_type: string): any[]{
            return this.data[fire_id][data_type]
        }
    }
})
