import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable, take } from 'rxjs';
import { GmailUser, Video } from '../models/firestore-schema/user.model';
import { AuthService } from './auth.service';
import { YoutubeVideoDetails } from '../models/youtube/youtube-response.model';

@Injectable()
export class DashboardService {
  userVideos$: Observable<Video[]>;
  communityVideos$: Observable<Video[]>;

  get getUserVideos(): Observable<Video[]> {
    return this.userVideos$;
  }

  get communityVideos(): Observable<Video[]> {
    return this.communityVideos$;
  }

  constructor(private firestore: AngularFirestore, private auth: AuthService) {}

  getVideos(userId): Observable<Video[]> {
    return this.userVideos$ = this.firestore.collection<Video>(`users/${userId}/videos/`).valueChanges();
  }

  getCommunityVideos(): Observable<Video[]> {
    return this.communityVideos$ = this.firestore.collectionGroup<Video>('videos',ref => ref.where('requestedCommunityHelp', '==', true)).valueChanges();
  }

  addVideo(videoId: string, userUid: string): void {
    const userRef: AngularFirestoreDocument<GmailUser> = this.firestore.doc(`users/${userUid}`);

    userRef.collection('videos').doc(videoId).set({videoId});
    this.userVideos$ = this.firestore.collection<Video>(`users/${userUid}/videos/`).valueChanges();
  }

  updateVideo(videoDetails: YoutubeVideoDetails, userUid: string): void {
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

  requestCommunityHelp(videoId: string, user: GmailUser): void {
    const userRef: AngularFirestoreDocument<GmailUser> = this.firestore.doc(`users/${user.uid}`);

    userRef.collection('videos').doc(videoId).set({requestedCommunityHelp: true}, {merge: true});

  }

}
