import { Component, Input, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { YoutubeService } from '../services/youtube.service';
import { BehaviorSubject, take, tap } from 'rxjs';
import { YoutubeVideoDetails } from '../models/youtube/youtube-response.model';
import { StorageService } from '../services/storage.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'subtitling-container',
  templateUrl: './subtitling-container.component.html',
  styleUrls: ['./subtitling-container.component.css'],
  providers: [StorageService]
})
export class SubtitlingContainerComponent implements OnInit {

  videoId: string;
  currentLanguage: string;
  videoDetails$: BehaviorSubject<YoutubeVideoDetails[]> = new BehaviorSubject<YoutubeVideoDetails[]>(null);
  videoDuration: string;
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private storage: AngularFireStorage = inject(AngularFireStorage);

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private youtubeService: YoutubeService,
    private storageService: StorageService,) { }

  ngOnInit(): void {
    this.videoId = this.route.snapshot.paramMap.get('id');
    this.currentLanguage = this.route.snapshot.paramMap.get('languageCode')
    this.youtubeService.getCaptions(this.videoId)
  }

  uploadToFirestorage(subtitleBlob: Blob): void {
    this.storageService.createFirestorageRef(this.storage, this.currentLanguage, subtitleBlob, this.videoId);
  }

  navigateToDetails(): void {
    this.router.navigate(['details', this.videoId]);

  }
}
