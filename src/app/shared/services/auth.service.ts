import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from '@firebase/auth';
import { Observable, of, switchMap } from 'rxjs';
import { GmailUser, User } from 'src/app/models/firestore-schema/user.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService  {
  user$: Observable<GmailUser>;

  constructor(private fireAuth: AngularFireAuth, private firestore: AngularFirestore,
    private router: Router) {

    this.user$ = this.fireAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.firestore.doc<GmailUser>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  async googleSignin() {
    const provider = new GoogleAuthProvider();
    const credential = await this.fireAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  async signOut() {
    await this.fireAuth.signOut();
    this.router.navigate(['/'])
  }

  private updateUserData(user: GmailUser) {
    //add user to firestore database on login
    const userRef: AngularFirestoreDocument<GmailUser> = this.firestore.doc(`users/${user.uid}`);

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }
    
    return userRef.set(data, {merge: true});
  }
}
