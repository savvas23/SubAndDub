import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { YoutubeVideoService } from './video-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  form: FormGroup;
  youtubeVideoId: string;

  constructor(private fb: FormBuilder, 
    private videoService: YoutubeVideoService){}

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
