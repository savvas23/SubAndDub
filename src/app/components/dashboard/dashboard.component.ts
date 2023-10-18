import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged, of, switchMap, take, tap } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit {
  user$: Observable<GmailUser>;
  userVideos$: Observable<Video[]> = new Observable<Video[]>;
  communityVideos$: Observable<Video[]> = new Observable<Video[]>;
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  youtubeVideoDetails: YoutubeVideoDetails[];
  userId$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  isFormOpen: boolean = false;
  listView: boolean = false;
  @ViewChild('userVideosContainer') userVideosContainer: ElementRef
  private storage: AngularFireStorage = inject(AngularFireStorage);

  constructor(private auth: AuthService, 
    private dashboardService: DashboardService, 
    private youtubeService: YoutubeService,
    private router: Router,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private renderer: Renderer2
    ) { }

  ngOnInit(): void {
    this.user$ = this.auth.user;
    this.loading$.next(true);
    combineLatest([
      this.user$,
      this.user$.pipe(
        distinctUntilChanged(),
        switchMap(user => {
          if (user) {
            this.userId$.next(user.uid);
            this.userVideos$ = this.dashboardService.getVideos(user.uid);
            this.communityVideos$ = this.dashboardService.getCommunityVideos();
            return combineLatest([this.userVideos$, this.communityVideos$]);
          } else {
            // If there is no user, return an empty observable
            return of(null);
          }
        })
      )
    ]).pipe(
      distinctUntilChanged(),
      switchMap(([user, [userVideos, communityVideos]]) => {
        const userVideoIds = userVideos.map(item => item.videoId);
        const communityVideoIds = communityVideos.map(item => item.videoId);
        
        // Using Set to ensure unique video IDs
        const uniqueVideoIds = new Set([...userVideoIds, ...communityVideoIds]);
        
        const allVideoIds = Array.from(uniqueVideoIds).join(',');
        return this.youtubeService.getVideoDetails(allVideoIds);
      })
    ).subscribe((res: YoutubeVideoDetails[]) => {
      if (res) {
        this.youtubeVideoDetails = res;
        this.loading$.next(false);
      }
    });
  }

  navigateToDetailsView(videoId: string): void {
    this.router.navigate(['/details', videoId]);
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

      if (result) this.addVideoToUserCollection(result);

    });
  }

  getVideoDetailsById(videoId: string): YoutubeVideoDetails {
    return this.youtubeVideoDetails.find((videoDetail) => videoDetail.id === videoId);
  }

  addVideoToUserCollection(videoDetails: string): void {
    this.dashboardService.addVideo(videoDetails, this.userId$.value);
  }

  requestCommunityHelp(videoId: string): void {
    this.user$.pipe(take(1)).subscribe((user: GmailUser) => { 
      this.dashboardService.requestCommunityHelp(videoId,user);
    })
  }

  changeToListView(): void {
    this.listView = true;
    this.renderer.removeClass(this.userVideosContainer.nativeElement,'grid-view');
    this.renderer.addClass(this.userVideosContainer.nativeElement,'list-view');
  }

  changeToGridView(): void {
    this.listView = false;
    this.renderer.removeClass(this.userVideosContainer.nativeElement,'list-view');
    this.renderer.addClass(this.userVideosContainer.nativeElement,'grid-view');
  }
}
