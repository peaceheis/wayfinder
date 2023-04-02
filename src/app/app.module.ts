import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { EdgereprComponent } from './edgerepr/edgerepr.component';

@NgModule({
  declarations: [
    AppComponent,
    EdgereprComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
