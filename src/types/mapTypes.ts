import { AxiosResponse } from "axios"
import type { Ref } from "vue" 

export type Coords = [number, number];

export interface LayerProp {
    id: string;
    data: any;
    [key: string]: any;
}
export namespace InfoPanelProps {

    export interface InfoPanelScale {
        variable: string
        colorRange: number[][]
        labels: string[]
    }
    export interface InfoPanelOption {
        name: string
        emitVal: string
        type?: string
        values?: string[]
        default: string | boolean | number
    }
    export interface Settings {
        type: string
        id: string
        title: string
        info: string
        // options?: any
        // scales?: any
        options? : InfoPanelOption[]
        scales?: InfoPanelScale[]
    }
}

export type MapMode = "Editing" | "Viewing"

export interface MapParamsType {
    mapType: string,
    mapID: string,
    templateID: string,
    fireID?: string,
    annotations?: any,
    initialTime?: string,
    SM?: boolean
}

export interface MapEditorType {
    // To identify which map is being edited in a given template 
    mapIdentifier: number
}

export namespace MapState {

    export interface Map{
        _metaData: MapMetaData;
        _viewState: ViewState;
        _data: IMapData;
    }

    export interface MapMetaData {
        readonly name: string;
        readonly id: string;
        readonly mType: string;
        active: boolean;
    }
    
    export interface ViewState {
        latitude: number; //38.544907,
        longitude: number; //-121.740517,
        zoom: number; // 6
        pitch: number; // 0
        bearing: number; //9
    }
    
    // DataBase Data
    export interface DBData {
        isFetched: boolean,
        data?: Array<any>
    }

    export interface annotationData {
        id: number,
        location: number[],
        text: string,
        timestamp: string,
        relevantLayers: MapState.Layer<any>[],
        highlighted: boolean
    }

    export interface IMapData {
        layerList: Layer<any> []
        annotations: annotationData[]
        currentTime?: number
    }

    export interface WaterData extends IMapData {
        data: DBData,
    }

    /* Map Data Types Single | Overview */
    export interface FireData  extends IMapData{
        
    }
    
    export interface SingleFire extends FireData {
        roads: DBData,
        temperature: DBData,
        humidity: DBData,
        wind: DBData,
        perimeter: DBData,
        frp: DBData,
        det: DBData,
        population: DBData,
        fireID: string,
        // annotation_to_add: annotationData,

        getDataFromStore(requestedData:string) : any;

        fetchPerimetersList(): Promise<AxiosResponse>;
        fetchFRP(area_acres: number, centroid: object, start_date: string, end_date: string): Promise<AxiosResponse>;
        fetchDetections(): Promise<AxiosResponse>;
        fetchPopulationBlocks(): Promise<AxiosResponse>;
        fetchRoads(): Promise<AxiosResponse>;
        fetchWind(start_date: string, end_date: string): Promise<AxiosResponse>;
    }
    
    export interface OverviewFires extends FireData {
        fireClusters: DBData,
        selectedFire: DBData

        fetchOverviewClusters(): Promise<AxiosResponse>;
    }
    
    /* Layer Interface */
    
    export interface Layer<Type> {
        description: string;
        icon: string;
        id: number;
        name: string;
        parameters: Type;
        type: string;
        visibility: boolean;
        [key: string]: any;
    }
    
    export interface LayerParams {
        opacity?: number; //0.75,
        pickable?: boolean; //true,
        visible?: boolean; //visiblity,
    }
    
    export interface TileMap extends LayerParams {
        url?: string;
        source?: string;
        data?: string;
    }
    
    export interface GeoJSONMap extends LayerParams {
        data?: string;
    }
    
}

