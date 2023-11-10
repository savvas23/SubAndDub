import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireStorageReference } from '@angular/fire/compat/storage/ref'
import { AuthService } from './auth.service';
import { take } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { GmailUser } from '../models/firestore-schema/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable()

export class StorageService {

    private storageRef: AngularFireStorage

    constructor(private authService: AuthService, private firestore: AngularFirestore, private snackbar: MatSnackBar) { }

    createFirestorageRef(storage: AngularFireStorage, language: string, subtitleBlob: Blob, videoId: string, format = 'sbv'): void {
        //sets up the Firestorage required references and receives required parameters to complete the upload proccess
        this.storageRef = storage;
        let pathRef: AngularFireStorageReference;
        this.authService.user.pipe(take(1)).subscribe(user => {
            const pathString = `subtitles/${user.uid}/${language}.${format}`
            pathRef = this.storageRef.ref(pathString);
            this.uploadToFirestorage(pathRef, subtitleBlob, user.uid, videoId , language);
        })
    }

    uploadToFirestorage(pathRef: AngularFireStorageReference, blob: Blob, userUid: string, videoId, language: string): void {
        pathRef.put(blob).then(() => {
            //update firestore record of user with the download url for this uploaded subtitle for future use
            const subRef: AngularFirestoreDocument = this.firestore.doc(`users/${userUid}/videos/${videoId}/subtitles/${language}`);
            pathRef.getDownloadURL().pipe(take(1)).subscribe((url: URL) => {
                subRef.update({storageUrl: url});
                this.snackbar.open('Upload Complete!','DISMISS', {duration:5000});
            })
        }, (reject) => {
            this.snackbar.open(reject.message);
        });
    }
}
