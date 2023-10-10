import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { YoutubeVideoDetails } from '../models/youtube/youtube-response.model';

@Injectable({
  providedIn: 'root'
})
export class DetailsViewServiceService {

  private youtubeVideoDetailsSource = new BehaviorSubject<YoutubeVideoDetails>(null);
  youtubeVideoDetails$ = this.youtubeVideoDetailsSource.asObservable();

  setYoutubeVideoDetails(data: any) {
    this.youtubeVideoDetailsSource.next(data);
  }
}