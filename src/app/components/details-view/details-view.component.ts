import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, take, tap } from 'rxjs';
import { YoutubeVideoDetails } from 'src/app/models/youtube/youtube-response.model';
import { DetailsViewServiceService } from 'src/app/services/details-view-service.service';
import { YoutubeService } from 'src/app/services/youtube.service';

@Component({
  selector: 'details-view',
  templateUrl: './details-view.component.html',
  styleUrls: ['./details-view.component.css']
})
export class DetailsViewComponent implements OnInit {
  videoId: string;
  videoDetails$: BehaviorSubject<YoutubeVideoDetails[]> = new BehaviorSubject<YoutubeVideoDetails[]>(null);
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  constructor(private route: ActivatedRoute, private router: Router,private youtubeService: YoutubeService, private detailsViewService: DetailsViewServiceService) { }

  ngOnInit(): void {
    this.videoId = this.route.snapshot.paramMap.get('id');
    this.youtubeService.getVideoDetails(this.videoId).pipe(
      tap(() => {
        this.loading$.next(true);
    })).subscribe((res) => {
      if (res) { 
        this.videoDetails$.next(res);
        this.loading$.next(false);
      }
    })
  }

  navigateToDashboard(): void {
    this.router.navigate(['dashboard']);
  }

}
