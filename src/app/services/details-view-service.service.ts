import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { GmailUser } from '../models/firestore-schema/user.model';
import { Language } from '../models/google/google-supported-languages';
import { Observable, merge, take } from 'rxjs';

@Injectable()

export class DetailsViewServiceService {

  subtitleLanguages$: Observable<Language[]>;

  getSubtitleLanguages(userUid: string, videoId: string): Observable<Language[]> {
    return this.subtitleLanguages$ = this.firestore.collection<Language>(`users/${userUid}/videos/${videoId}/subtitles`).valueChanges();;
  }

  constructor(private firestore: AngularFirestore) {}

  addSubtitle(videoId: string, language: Language, userUid: string): void {
    const videoRef: AngularFirestoreDocument = this.firestore.doc(`users/${userUid}/videos/${videoId}/subtitles/${language.language}`);

    const data = {
      humanReadable: language.name,
      ISOcode: language.language,
      lastUpdated: Date.now()
    }

    videoRef.set(data, {merge: true});
    this.subtitleLanguages$ = this.firestore.collection<Language>(`users/${userUid}/videos/${videoId}/subtitles`).valueChanges();
  }
}