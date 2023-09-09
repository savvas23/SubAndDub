import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { GmailUser, Video } from '../models/firestore-schema/user.model';
import { AuthService } from './auth.service';

@Injectable()
export class DashboardService implements OnInit {
  userVideos$: Observable<Video[]>;

  get getUserVideos(): Observable<Video[]> {
    return this.userVideos$;
  }

  constructor(private firestore: AngularFirestore, private auth: AuthService) { 

  }

  ngOnInit(): void {

    console.log(this.userVideos$)
  }

  getVideos(userId): Observable<Video[]> {
    return this.userVideos$ = this.firestore.collection<Video>(`users/${userId}/videos/`).valueChanges();
  }

  addVideo(videoId: string, userUid: string): void {

    const userRef: AngularFirestoreDocument<GmailUser> = this.firestore.doc(`users/${userUid}`);
    const data = {
      videos: videoId
    }

    userRef.collection('videos').doc(videoId).set({videoId});
    this.userVideos$ = this.firestore.collection<Video>(`users/${userUid}/videos/`).valueChanges();
  }
}
