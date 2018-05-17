import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { authComponents, authServices, authGuards } from './collections';

@NgModule({
  declarations: [...authComponents],
  imports: [
    ReactiveFormsModule,
    AngularFireAuthModule,
    SharedModule,
    AuthRoutingModule
  ],
  providers: [
    ...authServices,
    ...authGuards
  ]
})
export class AuthModule {}
