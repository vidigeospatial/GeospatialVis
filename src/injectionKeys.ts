import { InjectionKey, Ref, PropType } from "vue"
import { MapParamsType, MapEditorType, MapMode, MapState } from "@/types/mapTypes"
import type { IContentManager } from "./views/Components/editor/map/maputils/project_specific/project_specific.interface"

export const MAP_PARAMS_KEY: InjectionKey<MapParamsType> = Symbol('mapParams')
export const MAP_RESIZE_KEY: InjectionKey<Ref<boolean>> = Symbol('mapResize')
export const MAP_EDITOR_KEY: InjectionKey<MapEditorType> = Symbol('mapEditor')
export const MAP_MODE_KEY: InjectionKey<MapMode> = Symbol('mapMode')
export const MAP_VIEWSTATE_KEY: InjectionKey<Ref<MapState.ViewState>> = Symbol('mapViewState')
export const MAP_TIME_KEY: InjectionKey<Ref<number>> = Symbol('mapTime')
export const CONTENT_MANAGER_KEY: InjectionKey<PropType<IContentManager>> = Symbol('contentManager')
// export const CONTENT_MANAGER_KEY: InjectionKey<IContentManager> = Symbol('contentManager')
