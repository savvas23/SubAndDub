import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignInGuard } from './shared/guards/sign-in.guard';
import { AngularFireAuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { SubtitlingContainerComponent } from './subtitling-container/subtitling-container.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

const routes: Routes = [
  {path: '', component: SignInComponent, canActivate: [AngularFireAuthGuard], data:{ authGuardPipe: redirectLoggedInToDashboard }},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AngularFireAuthGuard], data:{ authGuardPipe: redirectUnauthorizedToLogin }},
  {path: 'edit/:id', component: SubtitlingContainerComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
