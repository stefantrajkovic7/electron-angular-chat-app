import { GroupsService } from './dashboard/services/groups.service';
import { MessagesService } from './dashboard/services/messages.service';
import { AuthService } from './auth/services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MaterialModule } from './material.module';
import {NgxMaskModule} from 'ngx-mask'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import {AngularFirestoreModule} from "angularfire2/firestore";
import {AngularFireModule} from "angularfire2";
import {environment} from "../environments/environment";
import {AuthModule} from "./auth/auth.module";
import {WelcomeComponent} from "./welcome.component";
import { AppRoutingModule } from './app.routing.module';
import { HttpClientModule } from '@angular/common/http'; 
import { HttpModule } from '@angular/http';


@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgxMaskModule.forRoot(),
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.config),
    MaterialModule,
    AuthModule
  ],
  providers: [AuthService, MessagesService, GroupsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
