import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestoreDocument, AngularFirestore } from 'angularfire2/firestore';
import { Router } from '@angular/router';

import * as firebase from 'firebase';
import { constants } from '../constants';
import { BehaviorSubject } from 'rxjs';
import { GroupsService } from '../../dashboard/services/groups.service';
import { MessagesService } from '../../dashboard/services/messages.service';

@Injectable()
export class AuthService {

  private authState: any;
  twitterUser = new BehaviorSubject<boolean>(false);
  

  constructor(private afauth: AngularFireAuth, private afs: AngularFirestore,
    private router: Router, private groupsService: GroupsService,
    private messagesService: MessagesService) {
    this.afauth.authState.subscribe((user) => {
      this.authState = user;
    
    })
    
  }

  authUser(): boolean {  
    return this.authState !== null && this.authState !== undefined ? true : false;
  }

  currentUserDetails(): firebase.User {
    return this.afauth.auth.currentUser;
  }
  
  get currentUserId(): string {
    return this.authState !== null ? this.authState.uid : '';
  }
  
  signUp(usercreds) {
    return this.afauth.auth.createUserWithEmailAndPassword(usercreds.email,
      usercreds.password).then((user) => {
        this.authState = user;
        this.afauth.auth.currentUser.updateProfile({
          displayName: usercreds.displayName,
          photoURL: constants.PROFILE_PIC
        }).then(() => {
          this.setUserData(usercreds.email, usercreds.displayName, user.photoURL);
        })
      })
  }

  setUserData(email: string, displayName: string, photoURL: string) {
    const path = `users/${this.currentUserId}`;
    const statuspath = `status/${this.currentUserId}`;
    const userdoc = this.afs.doc(path);
    const status = this.afs.doc(statuspath);
    userdoc.set({
      email: email,
      displayName: displayName,
      photoURL: photoURL
    });
    status.set({
      email: email,
      status: 'online'
    });
    this.router.navigate(['dashboard']);
  }

  googleUserData(email: string, displayName: string, photoURL: string) {
      this.afs.doc('users/' + this.afauth.auth.currentUser.uid).set({
        email: email,
        displayName: displayName,
        photoURL: photoURL
      }).then(() => {
        this.afs.doc('status/' + this.afauth.auth.currentUser.uid).set({
          email: email,
          status: 'offline'
        })
      })

      this.router.navigate(['dashboard']);
  }

  login(usercreds) {
    return this.afauth.auth.signInWithEmailAndPassword(usercreds.email,
      usercreds.password).then((user) => {
        this.authState = user;
        const status = 'online';
        this.setUserStatus(status);
        this.router.navigate(['dashboard']);
      })
  }

  setUserStatus(status) {
    const statuscollection = this.afs.doc(`status/${this.currentUserId}`);
    const data = {
      status: status
    }
    statuscollection.update(data).catch((error) => {
      console.log(error);
    })
  }

  logout() {
    this.setUserStatus('offline');
    this.afauth.auth.signOut().then(() => {
      this.messagesService.enterChat('closed');
      this.groupsService.enterGroup('closed');
      this.twitterUser.next(false);
      this.router.navigate(['login']);
    })
      .catch((err) => {
      console.log(err);
    })
  }
  

  twitterLogin(usercreds) {
    this.afauth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((user) => {
      this.googleUserData(this.afauth.auth.currentUser.email, this.afauth.auth
        .currentUser.displayName, this.afauth.auth.currentUser.photoURL);
      console.log(this.afauth.auth.currentUser);
      this.twitterUser.next(true);
    })
  }
}
