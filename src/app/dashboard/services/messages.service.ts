import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { BehaviorSubject, Subject } from 'rxjs';
import * as firebase from 'firebase';

import { GroupsService } from './groups.service';

@Injectable()
export class MessagesService {

  enteredChat = new BehaviorSubject<boolean>(false);
  currentChatUser;
  firstDocId: string;
  secondDocId: string;
  groupMsgFlag = new Subject();


  constructor(private afs: AngularFirestore, private afauth: AngularFireAuth,
              private storage: AngularFireStorage, private groupService: GroupsService) { }

  enterChat(user) {
    if (user !== 'closed') {
      this.currentChatUser = user;
      this.enteredChat.next(true);
    } else {
        this.enteredChat.next(false);
        this.currentChatUser = '';
    }
      
  }

  addNewMsg(newMsg) {
    const collRef = this.afs.collection('conversations').ref;
    const queryRef = collRef.where('myemail', '==', this.afauth.auth.currentUser.email)
      .where('withWhom', '==', this.currentChatUser.email);
    
    queryRef.get().then((snapShot) => {
      if (snapShot.empty) {
        this.afs.collection('conversations').add({
          myemail: this.afauth.auth.currentUser.email,
          withWhom: this.currentChatUser.email
        }).then((firstDocRef) => {
          this.firstDocId = firstDocRef.id;
          this.afs.collection('conversations').add({
            myemail: this.currentChatUser.email,
            withWhom: this.afauth.auth.currentUser.email
          }).then((secondDocRef) => {
            this.secondDocId = secondDocRef.id;
            this.afs.collection('messages').add({
              key: Math.floor(Math.random() * 10000000)
            }).then((docRef) => {
              this.afs.collection('messages').doc(docRef.id).collection('msgs').add({
                message: newMsg,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                sentby: this.afauth.auth.currentUser.email
              }).then(() => {
                this.afs.collection('conversations').doc(this.firstDocId).update({
                  messageId: docRef.id
                }).then(() => {
                  this.afs.collection('conversations').doc(this.secondDocId).update({
                    messageId: docRef.id
                  }).then(() => {
                    console.log('Done from If Part');
                    this.addNotifications();
                  })
                })
              })
            })
          })
        })
      } else {
            this.afs.collection('messages').doc(snapShot.docs[0].data().messageId).collection('msgs').add({
                message: newMsg,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                sentby: this.afauth.auth.currentUser.email
            }).then(() => {
                console.log('Done from else part');
                this.addNotifications();
            })
      }
    })
  }

  getAllMessages(count) {
    return new Promise((resolve) => {
      const collRef = this.afs.collection('conversations').ref;
      const queryRef = collRef.where('myemail', '==', this.afauth.auth.currentUser.email)
        .where('withWhom', '==', this.currentChatUser.email);
      
      queryRef.get().then((snapShot) => {
        if (snapShot.empty) {
          resolve(false);
        } else {
            resolve(this.afs.collection('messages').doc(snapShot.docs[0].data().messageId)
                .collection('msgs', ref => ref.orderBy('timestamp', "desc").limit(count)).valueChanges());
        }
      })
    })
  }

  addPicMsg(pic) {
    let downloadURL;
    const randNo = Math.floor(Math.random() * 10000000);
    const picName = 'picture' + randNo;
    const uploadTask = this.storage.upload('/picmessages/' + picName, pic);
    uploadTask.then((data: any) => {
      downloadURL = 'picMsg' + data.downloadURL;
      if (data.metadata.contentType.match('image/.*')) {
        this.addNewMsg(downloadURL);

      } else {
            data.ref.delete().then(() => {
            console.log('Not an image');
            })
      }
    }).catch((err) => {
      console.log('Upload failed');
      console.log(err);
      })
  }

  /* Group Chatting */

  addGroupMsg(newMessage) {
    const groupCollRef = this.afs.collection('groups').ref;
    const queryRef = groupCollRef.where('groupName', '==', this.groupService.currentGroup.groupName)
      .where('creator', '==', this.groupService.currentGroup.creator);
    
    queryRef.get().then((snapShot) => {
      const checkforMsgs = this.afs.doc('groupconvos/' + snapShot.docs[0].data().conversationId)
              .collection('messages').ref;
      if (checkforMsgs === undefined) {
        this.groupMsgFlag.next('firstmsg');
            }
      this.afs.doc('groupconvos/' + snapShot.docs[0].data().conversationId).collection('messages').add({
        message: newMessage,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        sentby: this.afauth.auth.currentUser.email
      })
    })
  }

      getGroupMessages(count) {
        return new Promise((resolve) => {
          const groupCollRef = this.afs.collection('groups').ref;
          const queryRef = groupCollRef.where('groupName', '==', this.groupService.currentGroup.groupName)
            .where('creator', '==', this.groupService.currentGroup.creator);
          
          queryRef.get().then((snapShot) => {
            const checkforMsgs = this.afs.doc('groupconvos/' + snapShot.docs[0].data().conversationId)
              .collection('messages').ref;
            if (checkforMsgs !== undefined) {
                resolve(this.afs.doc('groupconvos/' + snapShot.docs[0].data().conversationId)
                    .collection('messages', ref => ref.orderBy('timestamp', 'desc')
                    .limit(count))
                    .valueChanges());
            } else {
                resolve(this.groupMsgFlag);
                setTimeout(() => {
                    this.groupMsgFlag.next('Nothing');
                }, 1000);
            }
          })
        })
      }
  
      addGroupPic(pic) {
          let downloadURL;
          const randNo = Math.floor(Math.random() * 10000000);
          const picName = 'picture' + randNo;
          const uploadTask = this.storage.upload('/groupPicmessages/' + picName, pic);
          uploadTask.then((data: any) => {
            downloadURL = 'picMsg' + data.downloadURL;
            if (data.metadata.contentType.match('image/.*')) {
              this.addGroupMsg(downloadURL);
            } else {
                data.ref.delete().then(() => {
                    console.log('Not an image');
                })
            }
          }).catch((err) => {
            console.log('Upload failed');
            console.log(err);
            })
      }
  
      addNotifications() {
        this.afs.collection('notifications').add({
          reciever: this.currentChatUser.email,
          recieverName: this.currentChatUser.displayName,
          senderPic: this.afauth.auth.currentUser.photoURL,
          sender: this.afauth.auth.currentUser.email,
          senderName: this.afauth.auth.currentUser.displayName,
          type: 'message',
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
      }
  
      getMyNotifications() {
        return this.afs.collection('notifications', ref => ref.where('reciever', '==', this.afauth.auth.currentUser.email)).valueChanges();
      }
  
      clearNotifications() {
        const notificationsRef = this.afs.collection('notifications').ref;
        const queryRef = notificationsRef.where('sender', '==', this.currentChatUser.email);
        queryRef.get().then((snapShot) => {
          if (!snapShot.empty) {
            snapShot.docs.forEach((element) => {
              element.ref.delete();
            })
          }
        })
      }
  

}