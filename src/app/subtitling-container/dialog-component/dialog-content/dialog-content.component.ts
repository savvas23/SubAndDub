import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'dialog-content',
  templateUrl: './dialog-content.component.html',
  styleUrls: ['./dialog-content.component.css']
})
export class DialogContentComponent {
  @Input() dialogControl: FormControl;
  @Input() start_time: number;
  @Input() end_time: number;
  @Input() index: number;
}