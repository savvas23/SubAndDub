import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { GmailUser, Video } from 'src/app/models/firestore-schema/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { VideoInitFormComponent } from '../video-add-form/video-init-form.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit,OnDestroy {
  user$: Observable<GmailUser>;
  userVideos$: Observable<Video[]> = new Observable<Video[]>;
  userId$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  isFormOpen: boolean = false;
  constructor(private auth: AuthService, private dashboardService: DashboardService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.user$ = this.auth.user;
    this.user$.subscribe((user) => {
      if (user) {
        this.userId$.next(user?.uid);
        this.userVideos$ = this.dashboardService.getVideos(user.uid);
        this.userVideos$.subscribe(videos=>console.log(videos))
      }
    });
    console.log
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(VideoInitFormComponent,{
      height: '150px',
      
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.addVideoToUserCollection(result);
    });
  }

  addVideoToUserCollection(videoId: string): void {
    this.dashboardService.addVideo(videoId, this.userId$.value)
  }

  ngOnDestroy(): void {

  }
}
