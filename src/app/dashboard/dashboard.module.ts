import { NgModule } from '@angular/core';

import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared/shared.module';

// import { TrainingComponent } from './training.component';

import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
  declarations: [
    // TrainingComponent
  ],
  imports: [
    SharedModule,
    MaterialModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule {}
