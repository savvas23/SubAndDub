import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, take, tap } from 'rxjs';
import { YoutubeVideoDetails } from 'src/app/models/youtube/youtube-response.model';
import { DetailsViewServiceService } from 'src/app/services/details-view-service.service';
import { YoutubeService } from 'src/app/services/youtube.service';

@Component({
  selector: 'details-view',
  templateUrl: './details-view.component.html',
  styleUrls: ['./details-view.component.css']
})
export class DetailsViewComponent implements OnInit {
  videoId: string;
  videoDetails$: BehaviorSubject<YoutubeVideoDetails[]> = new BehaviorSubject<YoutubeVideoDetails[]>(null);
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  displayedColumns = ['Language', 'Last Updated', 'Subtitles'];
  dataSource;
  constructor(private route: ActivatedRoute, private router: Router,private youtubeService: YoutubeService, private detailsViewService: DetailsViewServiceService) { }

  ngOnInit(): void {

    this.dataSource = ELEMENT_DATA;
    this.videoId = this.route.snapshot.paramMap.get('id');
    this.youtubeService.getVideoDetails(this.videoId).pipe(
      tap(() => {
        this.loading$.next(true);
    })).subscribe((res) => {
      if (res) { 
        this.videoDetails$.next(res);
        this.loading$.next(false);
      }
    })
  }

  navigateToDashboard(): void {
    this.router.navigate(['dashboard']);
  }

}


export const ELEMENT_DATA = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'ayo', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];