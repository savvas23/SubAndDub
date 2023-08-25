import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DialogBox } from 'src/app/models/dialogBox.model';

@Component({
  selector: 'dialog-component',
  templateUrl: './dialog-component.component.html',
  styleUrls: ['./dialog-component.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogComponentComponent implements OnInit {
  public dialogBoxId: number = 1;
  public fileContent$ = new BehaviorSubject<string>(null);

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

  addDialogBox(): void {
    this.dialogBoxId++;

    this.form.addControl(((this.dialogBoxId + '-dialogBox')), this.fb.group({
      subtitles: this.fb.control(''),
      start_time: this.fb.control(this.setStartTimeControlValue()),
      end_time: this.fb.control(this.setEndTimeControlValue()),
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

  selectFile(event: Event): void {
    let file = (event.target as HTMLInputElement).files[0];
    this.readFile(file)
    .then((data: string | ArrayBuffer) => {
      this.fileContent$.next(data as string);
      console.log(this.fileContent$.value);
    })
  }

  private async readFile(file: File): Promise<string | ArrayBuffer> {
    return new Promise<string | ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.fileContent$.next(<string>reader.result);
        return resolve((e.target as FileReader).result);
      };
      
      reader.onerror = () => {
        console.error(`FileReader failed on file ${file.name}.`);
        return reject(null);
      };

      if (!file) {
        console.error('No file to read.');
        return reject(null);
      }

      reader.readAsText(file);
    });
  }
}
