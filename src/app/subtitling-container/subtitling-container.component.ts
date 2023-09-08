import { Component, Input } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'subtitling-container',
  templateUrl: './subtitling-container.component.html',
  styleUrls: ['./subtitling-container.component.css']
})
export class SubtitlingContainerComponent {
  
@Input() videoId: string;
  constructor(public auth: AuthService ) {}
}
