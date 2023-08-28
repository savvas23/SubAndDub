import { ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { DialogBox } from 'src/app/models/dialog-box.model';
import { GoogleTranslateRequestObject } from 'src/app/models/google-translate-request';
import { ImportModel } from 'src/app/models/import-sbv.model';
import { GoogleTranslateService } from 'src/app/shared/services/googletranslate.service';
import { UploadFileHandlerService } from 'src/app/shared/services/upload-file-handler.service';
import {GoogleTranslateResponse} from 'src/app/models/google-translate-response'
import { Language, Languages, SupportedLanguages } from 'src/app/models/google-supported-languages';
import { MatMenuTrigger } from '@angular/material/menu';
@Component({
  selector: 'dialog-component',
  templateUrl: './dialog-component.component.html',
  styleUrls: ['./dialog-component.component.css'],
  providers: [UploadFileHandlerService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogComponentComponent implements OnInit {
  public dialogBoxId: number = 1;
  public _supportedLanguages$: BehaviorSubject<SupportedLanguages> = new BehaviorSubject<SupportedLanguages>(null);
  protected loading: boolean;
  @ViewChild('translateMenu') translateMenu;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  public dialogBoxes: DialogBox[] = [{
    id: 1
  }];

  public form: FormGroup;

  get supportedLanguages$(): Observable<SupportedLanguages> {
    return this._supportedLanguages$;
  }

  constructor(private fb: FormBuilder, private fileService: UploadFileHandlerService, private google: GoogleTranslateService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      '1-dialogBox': this.fb.group({
        subtitles: this.fb.control(''),
        start_time: this.fb.control('00:00:00.00'),
        end_time: this.fb.control('00:00:02.00'),
      }),
    });

    this.getSupportedLanguages();
  }

  getDialogControl(dialogBoxId: number): FormGroup {
    return this.form.get(dialogBoxId + '-dialogBox') as FormGroup
  }

  addDialogBox(value: ImportModel = null): void {
    this.dialogBoxId++;
    this.form.addControl(((this.dialogBoxId + '-dialogBox')), this.fb.group({
      subtitles: this.fb.control((value?.subtitleText) ? value.subtitleText : ''),
      start_time: this.fb.control((value?.start_time) ? value.start_time : this.setStartTimeControlValue()),
      end_time: this.fb.control((value?.end_time) ? value.end_time : this.setEndTimeControlValue()),
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

  translateSubtitles(): void {
    let translationObject: GoogleTranslateRequestObject = {
      q: [],
      target: 'el'
    };
    let controllersToChange = {
      controlsName : []
    };
    Object.keys(this.form.controls).forEach(control=> {
      const controlValue = this.form.get(control).get('subtitles').value;
      if (controlValue) {
        translationObject.q.push(controlValue)
        controllersToChange.controlsName.push(control)
      }
    });

    if (translationObject.q) {
      this.google.translate(translationObject).subscribe((response: GoogleTranslateResponse) => {
        console.log(response.data)
      })
    }
  }

  getSupportedLanguages(): void {
    this.google.getSupportedLanguages()
    .pipe(tap(() => {
      this.loading = true;
    }))
    .subscribe((response: SupportedLanguages) => {
      this._supportedLanguages$.next(response)
      this.loading = false;
    });
  }

  handleFileUpload(event: BehaviorSubject<string | ArrayBuffer>): void {
    let fileContent = event.value as string;
    let cleanArray = this.fileService.cleanMultilineString(fileContent);
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
}
