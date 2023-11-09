import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GOOGLE_API_KEY } from 'src/config';
import { Video } from '../models/firestore-schema/user.model';
import { YoutubeResponse, YoutubeVideoDetails } from '../models/youtube/youtube-response.model';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  constructor(private http: HttpClient) { }

  getVideoDetails(videoIdsPayload: string): Observable<YoutubeVideoDetails[]> {
    const videoIds = videoIdsPayload;
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&part=statistics&part=contentDetails&id=${videoIds}&key=${GOOGLE_API_KEY}`
    return this.http.get<YoutubeResponse>(url).pipe(
      map((res) => {
        if (res)
          return res.items;
        return;
      }
    ));
  }
}
