import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-video-init-form',
  templateUrl: './video-init-form.component.html',
  styleUrls: ['./video-init-form.component.css']
})
export class VideoInitFormComponent {
  form: FormGroup;
  youtubeVideoId: string;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<VideoInitFormComponent>) { }
  
  ngOnInit(): void {
    const youtubeUrlPattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?=.*v=\w+)(?:\S+)?|embed\/\w+|v\/\w+|\S+)|youtu\.be\/\w+)(?:\S+)?$/;

    this.form = new FormGroup({
      youtubeUrl: this.fb.control('', [Validators.required, Validators.pattern(youtubeUrlPattern)])
    },
    {updateOn:'submit'});
  }

  onSubmit(): void {
    if (this.form.valid) {
      const controllerValue = this.form?.get('youtubeUrl')?.value as string;
      var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      var match = controllerValue.match(regExp);
      this.youtubeVideoId = (match && match[7].length === 11) ? match[7] : null;
      //exctract the video id from all possible youtube url combinations

      this.dialogRef.close(this.youtubeVideoId);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
