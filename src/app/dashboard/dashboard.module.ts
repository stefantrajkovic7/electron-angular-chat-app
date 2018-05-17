import { NgModule } from '@angular/core';

import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared/shared.module';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { dashboardComponents, dashboardServices, dashboardGuards } from './collections';

@NgModule({
  declarations: [
    ...dashboardComponents
  ],
  imports: [
    SharedModule,
    MaterialModule,
    DashboardRoutingModule
  ],
  providers: [
    ...dashboardServices,
    ...dashboardGuards
  ]
})
export class DashboardModule {}
