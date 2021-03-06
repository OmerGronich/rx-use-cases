import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WoltGameComponent } from './wolt-game.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: WoltGameComponent },
    ]),
  ],
  declarations: [WoltGameComponent],
})
export class WoltGameModule {}
