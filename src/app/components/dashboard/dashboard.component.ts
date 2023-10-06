import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, mergeMap, switchMap, tap} from 'rxjs';
import { GmailUser, Video } from 'src/app/models/firestore-schema/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { VideoInitFormComponent } from '../video-add-form/video-init-form.component';
import { YoutubeService } from 'src/app/services/youtube.service';
import { YoutubeVideoDetails } from 'src/app/models/youtube/youtube-response.model';
import { Router } from '@angular/router';
import { DialogConfirmationComponent } from 'src/app/shared/components/dialog-confirmation/dialog-confirmation.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit,OnDestroy {
  user$: Observable<GmailUser>;
  userVideos$: Observable<Video[]> = new Observable<Video[]>;
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  youtubeVideoDetails: YoutubeVideoDetails[];
  userId$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  isFormOpen: boolean = false;
  private storage: AngularFireStorage = inject(AngularFireStorage);

  constructor(private auth: AuthService, 
    private dashboardService: DashboardService, 
    private youtubeService: YoutubeService,
    private router: Router,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    ) { }

  ngOnInit(): void {
    this.user$ = this.auth.user;
    this.user$.pipe(tap(()=> {
      this.loading$.next(true);
        }),switchMap((user) => {
          if (user) {
            this.userId$.next(user?.uid);
            this.userVideos$ = this.dashboardService.getVideos(user.uid);
          return this.userVideos$.pipe(
            mergeMap((videos: Video[]) => {
              const commaSeperatedIds = videos.map(item => { return item.videoId }).join(',');
              return this.youtubeService.getVideoDetails(commaSeperatedIds);
            }));
    }})).subscribe((res: YoutubeVideoDetails[]) => {
          if (res) {
            this.youtubeVideoDetails = res;
            this.loading$.next(false);
          }
    });
    // console.log(this.storage.ref('path'))
  }

  navigateToEdit(videoId: string): void {
    this.router.navigate(['/edit', videoId]);
  }

  deleteVideoPrompt(videoId: string): void {
    const dialogRef= this.dialog.open(DialogConfirmationComponent, {width:'400px', scrollStrategy: new NoopScrollStrategy()});
    dialogRef.afterClosed().subscribe((deletionFlag) => {
      if (deletionFlag === true) {
        this.dashboardService.deleteVideo(videoId, this.userId$.value);
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(VideoInitFormComponent, {height: '150px'});
    dialogRef.afterClosed().subscribe((result: string) => {
      if (this.youtubeVideoDetails.map(details=> details.id).includes(result)) {
        this.snackbar.open('Video already exists in Collection.', 'DISMISS', {duration:5000});
        return;
      }
      this.addVideoToUserCollection(result);
    });
  }

  getVideoDetailsById(videoId: string): YoutubeVideoDetails {
    return this.youtubeVideoDetails.find((videoDetail) => videoDetail.id === videoId);
  }

  addVideoToUserCollection(videoDetails: string): void {
    this.dashboardService.addVideo(videoDetails, this.userId$.value);
  }

  ngOnDestroy(): void {

  }
}
