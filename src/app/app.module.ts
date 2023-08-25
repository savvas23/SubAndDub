import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { VideoPlayerComponent } from './subtitling-container/video-player/video-player.component';
import { SubtitlingContainerComponent } from './subtitling-container/subtitling-container.component';
import { DialogComponentComponent } from './subtitling-container/dialog-component/dialog-component.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatCardModule} from '@angular/material/card';
import { DialogContentComponent } from './subtitling-container/dialog-component/dialog-content/dialog-content.component';
import { ImportButtonComponent } from './shared/import-button/import-button.component';



@NgModule({
  declarations: [
    AppComponent,
    VideoPlayerComponent,
    SubtitlingContainerComponent,
    DialogComponentComponent,
    DialogContentComponent,
    ImportButtonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    YouTubePlayerModule,
    MatIconModule,
    MatTooltipModule,
    FlexLayoutModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
