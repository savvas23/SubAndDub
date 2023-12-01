import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { YoutubeVideoDetails } from 'src/app/models/youtube/youtube-response.model';

@Component({
  selector: 'community-video-card',
  templateUrl: './community-video-card.component.html',
  styleUrls: ['./community-video-card.component.css']
})
export class CommunityVideoCardComponent implements OnInit {
  @Input() videoId: string
  @Input() videoDetails: YoutubeVideoDetails;
  @Input() communityRequestDetails: any;
  @Output() editVideoEmitter: EventEmitter<any> = new EventEmitter<any>;
  @Output() deleteVideoEmitter: EventEmitter<string> = new EventEmitter<string>;
  @Output() requestCommunityHelpEmitter: EventEmitter<string> = new EventEmitter<string>;

  publishDate: string;

  constructor() { }

  ngOnInit(): void {
    console.log(this.communityRequestDetails)
    this.publishDate = this.timeSince(new Date(this.videoDetails?.snippet?.publishedAt));
  }

  editVideo(requestDetails: any): void {
    this.editVideoEmitter.emit(requestDetails);
  }

  timeSince(date: Date): string {

    let seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);
  
    let interval = seconds / 31536000;
  
    if (interval > 1) {
      return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }
}


