import { MapState } from './mapTypes'

export interface StoryCard {
    Title: string,
    Body: string,
    imgUrl: string,
    Tags: string
}
export interface Story {
    imgUrl: string;
    Title: string;
    Body: string;
    Tags: string;
    Presentation: Slide[];
}

export interface Slide {
    id: number;
    type: string;
    header?: string;
    body?: string;
    footnote?: string;
    imgSrc?: string;
    extImg?: boolean;
    fire_id?: string;
    annotations?: MapState.annotationData[];
    fire_id_left?: string;
    fire_id_right?: string;
    annotations_left?: MapState.annotationData[];
    text?: string;
    img?: string;
    textBlock?: string;
    imgSrc_left?: string;
    extImg_left?: boolean;
    imgSrc_right?: string;
    extImg_right?: boolean;
}
