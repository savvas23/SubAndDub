import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { YoutubeVideoDetails } from 'src/app/models/youtube/youtube-response.model';

@Component({
  selector: 'sub-timeline',
  templateUrl: './sub-timeline.component.html',
  styleUrls: ['./sub-timeline.component.css']
})

export class SubTimelineComponent implements OnChanges {
  @Input() videoDurationISO: string;
  durationReadable: number;

  ngOnChanges(changes?: SimpleChanges): void {
    const value = changes['videoDurationISO'].currentValue;
    if (value) {
      //parse youtube duration format like -> PT5M13S, to seconds
      var match = value.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

      match = match.slice(1).map(function(x) {
        if (x != null) {
            return x.replace(/\D/, '');
        }
      });
    
      var hours = (parseInt(match[0]) || 0);
      var minutes = (parseInt(match[1]) || 0);
      var seconds = (parseInt(match[2]) || 0);
    
      this.durationReadable = hours * 3600 + minutes * 60 + seconds;
    }
  }
}
