import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, mergeMap, switchMap, take} from 'rxjs';
import { GmailUser, Video } from 'src/app/models/firestore-schema/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { VideoInitFormComponent } from '../video-add-form/video-init-form.component';
import { YoutubeService } from 'src/app/services/youtube.service';
import { YoutubeVideoDetails } from 'src/app/models/youtube/youtube-response.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit,OnDestroy {
  user$: Observable<GmailUser>;
  userVideos$: Observable<Video[]> = new Observable<Video[]>;
  youtubeVideoDetails: YoutubeVideoDetails[];
  userId$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  isFormOpen: boolean = false;

  constructor(private auth: AuthService, private dashboardService: DashboardService, private youtubeService: YoutubeService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.user$ = this.auth.user;
    this.user$.pipe(switchMap((user) => {
        if (user) {
          this.userId$.next(user?.uid);
          this.userVideos$ = this.dashboardService.getVideos(user.uid);

          return this.userVideos$.pipe(
            mergeMap((videos) => {
              return this.youtubeService.getVideoDetails(videos);
            })
          );
        }
      })).subscribe((res: YoutubeVideoDetails[]) => {
        if (res) {
          this.youtubeVideoDetails = res;
          console.log(this.youtubeVideoDetails)
        }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(VideoInitFormComponent,{ height: '150px'});

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.addVideoToUserCollection(result);
    });
  }

  getVideoDetailsById(videoId: string): any {
    return this.youtubeVideoDetails.find((videoDetail) => videoDetail.id === videoId);
  }

  addVideoToUserCollection(videoId: string): void {
    this.dashboardService.addVideo(videoId, this.userId$.value)
  }

  ngOnDestroy(): void {

  }
}
