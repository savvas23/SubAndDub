import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, switchMap, take, tap } from 'rxjs';
import { Language, SupportedLanguages } from 'src/app/models/google/google-supported-languages';
import { YoutubeVideoDetails } from 'src/app/models/youtube/youtube-response.model';
import { AuthService } from 'src/app/services/auth.service';
import { DetailsViewServiceService } from 'src/app/services/details-view-service.service';
import { GoogleTranslateService } from 'src/app/services/googletranslate.service';
import { YoutubeService } from 'src/app/services/youtube.service';

@Component({
  selector: 'details-view',
  templateUrl: './details-view.component.html',
  styleUrls: ['./details-view.component.css'],
  providers: [GoogleTranslateService, DetailsViewServiceService]
})
export class DetailsViewComponent implements OnInit {
  videoId: string;
  videoDetails$: BehaviorSubject<YoutubeVideoDetails[]> = new BehaviorSubject<YoutubeVideoDetails[]>(null);
  supportedLanguages$: BehaviorSubject<SupportedLanguages> = new BehaviorSubject<SupportedLanguages>(null);
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  userId$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  dataSource: Language[];

  @ViewChild('translateMenu') translateMenu;

  displayedColumns = ['Language', 'Last Updated', 'Subtitles'];
  constructor(private route: ActivatedRoute, 
    private router: Router,
    private youtubeService: YoutubeService,
    private authService: AuthService,
    private translateService: GoogleTranslateService,
    private detailsViewService: DetailsViewServiceService) { }

  ngOnInit(): void {
    this.videoId = this.route.snapshot.paramMap.get('id');

    this.authService.user.pipe(take(1),
      switchMap(user => {
        if (user) {
          this.userId$.next(user.uid);
          return this.detailsViewService.getSubtitleLanguages(this.userId$.value, this.videoId);
        } else {
          return of(null); // Return an empty observable if there is no user
        }
      })).subscribe(languages => {
      this.dataSource = languages;
      console.log(this.dataSource)
    });

    this.youtubeService.getVideoDetails(this.videoId).pipe(
      tap(() => {
        this.loading$.next(true);
      })).subscribe((res) => {
      if (res) { 
        this.videoDetails$.next(res);
        this.loading$.next(false);
      }
    });

    this.getSupportedLanguages();
  }

  getSupportedLanguages(): void {
    this.translateService.getSupportedLanguages()
    .pipe(tap(() => {
      this.loading$.next(true)
    }))
    .subscribe((response: SupportedLanguages) => {
      this.supportedLanguages$.next(response);
      this.loading$.next(false)
    });
    
    console.log(this.supportedLanguages$)
  }

  addSubtitle(language: Language): void {
    this.detailsViewService.addSubtitle(this.videoId, language, this.userId$.value);
  }

  editSubtitle(ISOcode): void {
    this.router.navigate(['edit',this.videoId,ISOcode])
  }

  navigateToDashboard(): void {
    this.router.navigate(['dashboard']);
  }
}