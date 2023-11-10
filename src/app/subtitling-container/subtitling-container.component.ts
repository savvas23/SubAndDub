import { Component, Input, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { YoutubeService } from '../services/youtube.service';
import { BehaviorSubject, take, tap } from 'rxjs';
import { YoutubeVideoDetails } from '../models/youtube/youtube-response.model';
import { StorageService } from '../services/storage.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UnsavedChangesDialogComponent } from '../components/dialog-modal/unsaved-changes-dialog/unsaved-changes-dialog.component';


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
  isFormDirty: boolean = false;
  private storage: AngularFireStorage = inject(AngularFireStorage);

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private storageService: StorageService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.videoId = this.route.snapshot.paramMap.get('id');
    this.currentLanguage = this.route.snapshot.paramMap.get('languageCode')
  }

  setFormDirtyStatus(isDirty: boolean): void {
    this.isFormDirty = isDirty;
  }

  uploadToFirestorage(subtitleBlob: Blob): void {
    this.storageService.createFirestorageRef(this.storage, this.currentLanguage, subtitleBlob, this.videoId);
  }

  navigateTTS(): void {
    this.router.navigate(['generate-tts', this.videoId, this.currentLanguage]);
  }

  navigateToDetails(): void {
    if (this.isFormDirty) {
      this.dialog.open(UnsavedChangesDialogComponent, {'width' : '500px' }).afterClosed().subscribe((res) => {
        if (res) this.router.navigate(['details', this.videoId]);
      });
    } else {
      this.router.navigate(['details', this.videoId]);
    }
  }
}
