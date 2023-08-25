import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DialogBox } from 'src/app/models/dialog-box.model';
import { ImportModel } from 'src/app/models/import-sbv.model';

@Component({
  selector: 'dialog-component',
  templateUrl: './dialog-component.component.html',
  styleUrls: ['./dialog-component.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogComponentComponent implements OnInit {
  public dialogBoxId: number = 1;

  public dialogBoxes: DialogBox[] = [{
    id: 1
  }];

  public form: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      '1-dialogBox': this.fb.group({
        subtitles: this.fb.control(''),
        start_time: this.fb.control('00:00:00.00'),
        end_time: this.fb.control('00:00:02.00'),
      }),
    })
  }

  getDialogControl(dialogBoxId: number): FormGroup {
    return this.form.get(dialogBoxId + '-dialogBox') as FormGroup
  }

  addDialogBox(value?: ImportModel): void {
    this.dialogBoxId++;
    this.form.addControl(((this.dialogBoxId + '-dialogBox')), this.fb.group({
      subtitles: this.fb.control((value.start_time) ? value.subtitleText : ''),
      start_time: this.fb.control((value.start_time) ? value.start_time : this.setStartTimeControlValue()),
      end_time: this.fb.control((value.end_time) ? value.end_time : this.setStartTimeControlValue()),
    }));

    this.dialogBoxes.push({
      id: this.dialogBoxId
    });
  }

  deleteDialogBox(deleteId: number): void {
    this.form.removeControl(deleteId + '-dialogBox')
    this.dialogBoxes = this.dialogBoxes.filter(dialogBox => dialogBox.id !== deleteId);
  }

  setStartTimeControlValue(): string {
    if (this.dialogBoxes.length) {
      const prevControlIndex = Object.keys(this.form.controls).length - 1;
      const prevControl = Object.keys(this.form.controls);
      const targetControlString = prevControl[prevControlIndex].toString(); // get the string value of the name of last element of the form controls
      return this.form.get(targetControlString).get('end_time').value as string;
    } else {
      return '00:00:00.00';
    }
  }

  setEndTimeControlValue(): string {
    if (this.dialogBoxes.length) {
      const prevControlIndex = Object.keys(this.form.controls).length - 1;
      const prevControl = Object.keys(this.form.controls);
      const targetControlString = prevControl[prevControlIndex].toString();
      const prevEndTime = this.form.get(targetControlString).get('end_time').value as string; // // get the string value of the name of last element of the form controls
      const prevEndTimeSplit = prevEndTime.split(':');
      let lastElement = parseInt(prevEndTimeSplit[2]); // Convert the last element to a number
      lastElement += 2; // Increase the last element by 2
      prevEndTimeSplit[2] = lastElement.toString(); //
  
      if (prevEndTimeSplit[2].length === 1) { //check if its 1 digit number and '0' infront to conform with time format
        prevEndTimeSplit[2] = '0' + prevEndTimeSplit[2];
      }

      return prevEndTimeSplit.join(':');

    } else {
        return '00:00:02.00';
    }
  }

  handleFileUpload(event: BehaviorSubject<string | ArrayBuffer>): void {
    let fileContent = event.value as string;
    let cleanArray = this.cleanMultilineString(fileContent);
    // clear all controls, to rebuild form
    Object.keys(this.form.controls).forEach(control=> {
      this.form.removeControl(control);
    })
    this.dialogBoxes = [];
    this.dialogBoxId = 0;
    for (let individualSub of cleanArray) {
      this.addDialogBox(individualSub);
    }
  }

  cleanMultilineString(input: string): ImportModel[] {
    const lines = input.trim().split('\n\n');
    const result: ImportModel[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split('\n');
      const timestamp = parts[0].trim().split(',');

      const start_time = this.formatTimestamp(timestamp[0]);
      const end_time = this.formatTimestamp(timestamp[1]);

      let subtitleText = "";
      if (parts.length > 1) {
        subtitleText = parts[1].trim();
      }
    
      result.push({
        start_time: start_time,
        end_time: end_time,
        subtitleText: subtitleText
      });
    }

    return result;
  }

  formatTimestamp(timestamp: string): string {
    const parts = timestamp.split(':');
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].length === 1) {
            parts[i] = '0' + parts[i];
        }
    }
    return parts.join(':');
}
}
