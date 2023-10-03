import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { YoutubeService } from '../services/youtube.service';
import { BehaviorSubject, take, tap } from 'rxjs';
import { YoutubeVideoDetails } from '../models/youtube/youtube-response.model';

@Component({
  selector: 'subtitling-container',
  templateUrl: './subtitling-container.component.html',
  styleUrls: ['./subtitling-container.component.css']
})
export class SubtitlingContainerComponent implements OnInit{
  
@Input() videoId: string;
videoDetails$: BehaviorSubject<YoutubeVideoDetails[]> = new BehaviorSubject<YoutubeVideoDetails[]>(null);
videoDuration: string;
loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
constructor(private route: ActivatedRoute, private router: Router, private youtubeService: YoutubeService) { }

ngOnInit(): void {
    this.videoId = this.route.snapshot.paramMap.get('id');
    // this.youtubeService.getVideoDetails(this.videoId).pipe(take(1),tap(() => {
    //   this.loading$.next(true);
    // })).subscribe((res) => {
    //   if (res) { 
    //     this.videoDetails$.next(res);
    //     this.videoDuration = this.videoDetails$.value[0].contentDetails.duration;
    //     this.loading$.next(false);
    //   }
    // })
}

navigateToDashboard(): void {
    this.router.navigate(['dashboard']);
  }
}
