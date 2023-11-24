import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireStorageReference } from '@angular/fire/compat/storage/ref'
import { AuthService } from './auth.service';
import { Observable, map, switchMap, take } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

@Injectable()

export class StorageService {

    private storageRef: AngularFireStorage

    constructor(private http: HttpClient,private authService: AuthService, private firestore: AngularFirestore, private snackbar: MatSnackBar) { }

    createFirestorageRef(storage: AngularFireStorage, language: string, subtitle: Blob, videoId: string, filePath: string): void {
        //sets up the Firestorage required references and receives required parameters to complete the upload proccess
        this.storageRef = storage;
        let pathRef: AngularFireStorageReference;
        this.authService.user.pipe(take(1)).subscribe(user => {
            const pathString = `subtitles/${user.uid}/${videoId}/${language}/${filePath}`
            pathRef = this.storageRef.ref(pathString);
            this.uploadToFirestorage(pathRef, subtitle, user.uid, videoId , language,filePath);
        })
    }

    uploadToFirestorage(pathRef: AngularFireStorageReference, subtitle: Blob, userUid: string, videoId, language: string, filePath:string): void {
        pathRef.put(subtitle).then(() => {
            //update firestore record of user with the download url for this uploaded subtitle for future use
            const subRef: AngularFirestoreDocument = this.firestore.doc(`users/${userUid}/videos/${videoId}/subtitleLanguages/${language}/subtitles/${filePath.split('.')[0]}`);
            pathRef.getDownloadURL().pipe(take(1)).subscribe((url: URL) => {
                subRef.update({
                    storageUrl: url,
                    lastUpdated: Date.now()
                });
                this.snackbar.open('Update Complete!','DISMISS', {duration:5000});
            })
        }, (reject) => {
            this.snackbar.open(reject.message);
        });
    }

    getSubtitleURL(videoId: string, isoCode: string, subtitleName:string): Observable<string> {
        return this.authService.user.pipe(
            take(1),
            switchMap(user => {
                const subRef: AngularFirestoreDocument = this.firestore.doc(`users/${user.uid}/videos/${videoId}/subtitleLanguages/${isoCode}/subtitles/${subtitleName.split('.')[0]}`);
                return subRef.get();
            }),
            map(doc => {
                return doc.get('storageUrl');
            })
        );
    }

    fetchSubtitleFile(url: string): Observable<string> {
       return this.http.get(url, {responseType: 'text'})
    }
}
