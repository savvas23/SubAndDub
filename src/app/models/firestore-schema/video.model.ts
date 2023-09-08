import { Subtitle } from "./subtitle.model";

export interface Video {
    uid: string;
    title: string;
    subtitles?: Subtitle[];
}