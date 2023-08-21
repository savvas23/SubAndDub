import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'dialog-component',
  templateUrl: './dialog-component.component.html',
  styleUrls: ['./dialog-component.component.css']
})
export class DialogComponentComponent implements OnInit {
  private dialogBoxId: number = 1;

  public dialogBoxes: DialogBox[] = [{
    subtitles: '',
    start_time: 0,
    end_time: 2,
    id: 1
  }];

  private form: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      '1-dialogBox': this.fb.group({
        subtitles: this.fb.control(null),
        start_time: this.fb.control(null),
        end_time: this.fb.control(null),
      }),
    })
  }

  addDialogBox(): void {
    this.dialogBoxId++;
    this.form.addControl((this.dialogBoxId + '-dialogBox'), this.fb.group({
      subtitles: this.fb.control(null),
      start_time: this.fb.control(null),
      end_time: this.fb.control(null),
    }));
    this.dialogBoxes.push({
      subtitles: '',
      start_time: this.dialogBoxes[length - 1].end_time,
      end_time:this.dialogBoxes[length - 1].end_time + 2,
      id: this.dialogBoxId
    });

  }
}


export class DialogBox {
  subtitles: string;
  start_time: number;
  end_time: number;
  id: number;
}

