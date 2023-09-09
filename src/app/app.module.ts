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
import { MatCardModule } from '@angular/material/card';
import { DialogContentComponent } from './subtitling-container/dialog-component/dialog-content/dialog-content.component';
import { ImportButtonComponent } from './shared/components/import-button/import-button.component';
import { HttpClientModule } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { MenuComponent } from './top-toolbar/menu/menu.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from 'src/environments/environment';
import { LoginButtonComponent } from './shared/components/login-button/login-button.component';
import { MatToolbarModule} from '@angular/material/toolbar';
import { VideoInitFormComponent } from './components/video-add-form/video-init-form.component';
import { UserVideosComponent } from './subtitling-container/user-videos/user-videos.component';
import { MatDividerModule} from '@angular/material/divider';
import { HomeCardsComponent } from './shared/components/home-cards/home-cards.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { MatDialogModule} from '@angular/material/dialog';
import { VideoCardComponent } from './components/video-card/video-card.component';




@NgModule({
  declarations: [
    AppComponent,
    VideoPlayerComponent,
    SubtitlingContainerComponent,
    DialogComponentComponent,
    DialogContentComponent,
    ImportButtonComponent,
    LoaderComponent,
    MenuComponent,
    LoginButtonComponent,
    VideoInitFormComponent,
    UserVideosComponent,
    HomeCardsComponent,
    DashboardComponent,
    SignInComponent,
    VideoCardComponent,
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
    MatCardModule,
    HttpClientModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    MatToolbarModule,
    MatDividerModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
