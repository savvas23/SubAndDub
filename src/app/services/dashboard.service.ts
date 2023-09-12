import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { GmailUser, Video } from '../models/firestore-schema/user.model';
import { AuthService } from './auth.service';
import { YoutubeVideoDetails } from '../models/youtube/youtube-response.model';

@Injectable()
export class DashboardService {
  userVideos$: Observable<Video[]>;

  get getUserVideos(): Observable<Video[]> {
    return this.userVideos$;
  }

  constructor(private firestore: AngularFirestore, private auth: AuthService) {}

  getVideos(userId): Observable<Video[]> {
    return this.userVideos$ = this.firestore.collection<Video>(`users/${userId}/videos/`).valueChanges();
  }

  addVideo(videoId: string, userUid: string): void {
    const userRef: AngularFirestoreDocument<GmailUser> = this.firestore.doc(`users/${userUid}`);

    userRef.collection('videos').doc(videoId).set({videoId});
    this.userVideos$ = this.firestore.collection<Video>(`users/${userUid}/videos/`).valueChanges();
  }

  updateVideo(videoDetails: YoutubeVideoDetails, userUid: string): void {
    console.log(videoDetails)
    const userRef: AngularFirestoreDocument<GmailUser> = this.firestore.doc(`users/${userUid}`);

    const data = {
      videoId: videoDetails.id,
      title: videoDetails.snippet.title,
      channel: videoDetails.snippet.channelTitle,
      views: videoDetails.statistics.viewCount,
      published: videoDetails.snippet.publishedAt
    };

    userRef.collection('videos').doc(videoDetails.id).update(data);
  }

  deleteVideo(videoId: string, userUid: string): void {
    const userRef: AngularFirestoreDocument<GmailUser> = this.firestore.doc(`users/${userUid}/videos/${videoId}`);
    userRef.delete();
  }

}
