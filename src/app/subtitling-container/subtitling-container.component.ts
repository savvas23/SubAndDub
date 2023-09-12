import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'subtitling-container',
  templateUrl: './subtitling-container.component.html',
  styleUrls: ['./subtitling-container.component.css']
})
export class SubtitlingContainerComponent implements OnInit{
  
@Input() videoId: string;
  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.videoId = this.route.snapshot.paramMap.get('id');
  }

  navigateToDashboard(): void {
    this.router.navigate(['dashboard']);
  }
}
