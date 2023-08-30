import { Component, Input } from '@angular/core';

@Component({
  selector: 'subtitling-container',
  templateUrl: './subtitling-container.component.html',
  styleUrls: ['./subtitling-container.component.css']
})
export class SubtitlingContainerComponent {
  
@Input() videoId: string;

}
