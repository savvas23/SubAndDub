import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-video-init-form',
  templateUrl: './video-init-form.component.html',
  styleUrls: ['./video-init-form.component.css']
})
export class VideoInitFormComponent {
  form: FormGroup;
  youtubeVideoId: string;

  constructor(private fb: FormBuilder){}
  
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
      this.youtubeVideoId = controllerValue.split('v=')[1]; //returns the ID part of the youtube video URL
    }
  }
}
