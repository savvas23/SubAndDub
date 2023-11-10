import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { AngularFireAuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { SubtitlingContainerComponent } from './subtitling-container/subtitling-container.component';
import { DetailsViewComponent } from './components/details-view/details-view.component';
import { GenerateTTSComponent } from './components/generate-tts/generate-tts/generate-tts.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

const routes: Routes = [
  {path: '', component: SignInComponent, canActivate: [AngularFireAuthGuard], data:{ authGuardPipe: redirectLoggedInToDashboard }},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AngularFireAuthGuard], data:{ authGuardPipe: redirectUnauthorizedToLogin }},
  {path: 'details/:id', component: DetailsViewComponent, canActivate: [AngularFireAuthGuard], data:{ authGuardPipe: redirectUnauthorizedToLogin }},
  {path: 'edit/:id/:languageCode', component: SubtitlingContainerComponent, canActivate: [AngularFireAuthGuard], data:{ authGuardPipe: redirectUnauthorizedToLogin }},
  {path: 'generate-tts/:id/:languageCode', component: GenerateTTSComponent, canActivate: [AngularFireAuthGuard], data:{ authGuardPipe: redirectUnauthorizedToLogin }}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
