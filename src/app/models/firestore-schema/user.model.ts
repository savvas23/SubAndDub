import { Video } from "./video.model";

export interface User {
    uid: string;
    displayName?: string;
    videos?: Video[];
}

export interface GmailUser extends User {
    email: string;
    photoURL?: string;
}