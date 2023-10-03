import { Component, OnInit,ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { DialogBox } from 'src/app/models/general/dialog-box.model';
import { GoogleTranslateRequestObject } from 'src/app/models/google/google-translate-request';
import { ImportModel } from 'src/app/models/general/import-sbv.model';
import { GoogleTranslateService } from 'src/app/services/googletranslate.service';
import { UploadFileHandlerService } from 'src/app/services/upload-file-handler.service';
import { GoogleTranslateResponse, GoogleTranslations} from 'src/app/models/google/google-translate-response'
import { SupportedLanguages } from 'src/app/models/google/google-supported-languages';
import { MatMenuTrigger } from '@angular/material/menu';
import { TimeFormat } from 'src/app/models/general/time-format.model';
import { TimeEmitterObject } from './dialog-content/dialog-content.component';

@Component({
  selector: 'dialog-component',
  templateUrl: './dialog-component.component.html',
  styleUrls: ['./dialog-component.component.css'],
  providers: [UploadFileHandlerService, GoogleTranslateService]
})
export class DialogComponentComponent implements OnInit {
  public dialogBoxId: number = 1;
  public _supportedLanguages$: BehaviorSubject<SupportedLanguages> = new BehaviorSubject<SupportedLanguages>(null);
  public _translatedText$: BehaviorSubject<GoogleTranslateResponse> = new BehaviorSubject<GoogleTranslateResponse>(null);
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

  constructor(private fb: FormBuilder,
    private fileService: UploadFileHandlerService,
    private google: GoogleTranslateService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      '1-dialogBox': this.fb.group({
        subtitles: this.fb.control(''),
        start_time: this.fb.control('00:00:00.000'),
        end_time: this.fb.control('00:00:02.000'),
      }),
    });

    this.getSupportedLanguages();
  }

  getDialogControl(dialogBoxId: number): FormGroup {
    return this.form.get(dialogBoxId + '-dialogBox') as FormGroup
  }

  addDialogBox(value: ImportModel = null): void {
    this.dialogBoxId ++;
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
    this.form.removeControl(deleteId + '-dialogBox');
    this.dialogBoxes = this.dialogBoxes.filter(dialogBox => dialogBox.id !== deleteId);
  }

  setStartTimeControlValue(): string {
    if (this.dialogBoxes.length) {
      const prevControlIndex = Object.keys(this.form.controls).length - 1;
      const prevControl = Object.keys(this.form.controls);
      const targetControlString = prevControl[prevControlIndex].toString(); // get the string value of the name of last element of the form controls
      return this.form?.get(targetControlString)?.get('end_time')?.value as string;
    } else {
      return '00:00:00.000';
    }
  }

  setEndTimeControlValue(): string {
    if (this.dialogBoxes.length) {
      const prevControlIndex = Object.keys(this.form.controls).length - 1;
      const prevControl = Object.keys(this.form.controls);
      const targetControlString = prevControl[prevControlIndex].toString();
      const prevEndTime = this.form?.get(targetControlString)?.get('end_time')?.value as string; // // get the string value of the name of last element of the form controls
      const prevEndTimeSplit = prevEndTime.split(':');
      let lastElement = parseInt(prevEndTimeSplit[2]); // Convert the last element to a number
      lastElement += 2; // Increase the last element by 2
      prevEndTimeSplit[2] = lastElement.toString(); //
  
      if (prevEndTimeSplit[2].length === 1) { //check if its 1 digit number and '0' infront to conform with time format
        prevEndTimeSplit[2] = '0' + prevEndTimeSplit[2];
      }
      return prevEndTimeSplit.join(':') + '.000'; //change at a later stage to calculate actual miliseconds from previous value

    } else {
        return '00:00:02.000';
    }
  }

  timeRangeValidation(dialogContent: TimeEmitterObject): void {
    const prevGroup = this.form.get((dialogContent.id - 1) + '-dialogBox') as FormGroup;
    const currentGroup = this.form.get(dialogContent.id + '-dialogBox') as FormGroup;
    const nextGroup = this.form.get((dialogContent.id + 1) + '-dialogBox') as FormGroup;

    const startTimestampFormatted = parseTimestamp(currentGroup.get('start_time').value);
    const endTimestampFormatted = parseTimestamp(currentGroup.get('end_time').value);

    (dialogContent.control === 'start_time') ? 
    this.startTimeValidation(prevGroup, currentGroup, startTimestampFormatted, endTimestampFormatted) :
    this.endTimeValidation(nextGroup, currentGroup, startTimestampFormatted, endTimestampFormatted);
  }

  startTimeValidation(prevGroup: FormGroup, currentGroup: FormGroup, startTimestampFormatted: TimeFormat, endTimestampFormatted: TimeFormat): void {

    if (calculateSeconds(startTimestampFormatted) > calculateSeconds(endTimestampFormatted)) {
      currentGroup.get('start_time').setErrors({higherStartTime:true});
    } else {
      currentGroup.get('start_time').setErrors(null);
    }

    if (prevGroup) {
      const prevEndTimestampFormatted = parseTimestamp(prevGroup?.get('end_time')?.value);
      if (calculateSeconds(prevEndTimestampFormatted) > calculateSeconds(startTimestampFormatted)) {
        currentGroup.get('start_time').setErrors({higherPrevEndTime:true});
        prevGroup.get('end_time').setErrors({higherPrevEndTime:true});
      } else if (calculateSeconds(startTimestampFormatted) > calculateSeconds(endTimestampFormatted)) {
        currentGroup.get('start_time').setErrors({higherStartTime:true});
      } else {
        currentGroup.get('start_time').setErrors(null);
        prevGroup.get('end_time').setErrors(null);
      }
      currentGroup.get('start_time').markAsTouched();
      prevGroup.get('end_time').markAsTouched();
    }
  }

  endTimeValidation(nextGroup: FormGroup, currentGroup: FormGroup, startTimestampFormatted: TimeFormat, endTimestampFormatted: TimeFormat): void {

    if (calculateSeconds(startTimestampFormatted) > calculateSeconds(endTimestampFormatted)) {
      currentGroup.get('start_time').setErrors({higherStartTime:true});
    } else {
      currentGroup.get('start_time').setErrors(null);
    }

    if (nextGroup) {
      const nextStartTimestampFormatted = parseTimestamp(nextGroup?.get('start_time')?.value);
      if (calculateSeconds(nextStartTimestampFormatted) < calculateSeconds(endTimestampFormatted)) {
        currentGroup.get('end_time').setErrors({higherPrevEndTime:true});
        nextGroup.get('start_time').setErrors({higherPrevEndTime:true});
      } else {
        currentGroup.get('end_time').setErrors(null);
        nextGroup.get('start_time').setErrors(null);
      }
      currentGroup.get('end_time').markAsTouched();
      nextGroup.get('start_time').markAsTouched();
    }
  }

  translateSubtitles(targetLanguage: string): void {
    let translationObject: GoogleTranslateRequestObject = {
      q: [],
      target: targetLanguage
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
        this._translatedText$.next(response);
        let translationArray: GoogleTranslations[] = this._translatedText$.value.data['translations'];

        if (translationArray) {
          for (let i = 0; i < controllersToChange.controlsName.length; i++) {
            const control = this.form.get(controllersToChange.controlsName[i]).get('subtitles');
            control.setValue(translationArray[i].translatedText);
          }
        }
      });
    }
  }

  getSupportedLanguages(): void {
    this.google.getSupportedLanguages()
    .pipe(tap(() => {
      this.loading = true;
    }))
    .subscribe((response: SupportedLanguages) => {
      this._supportedLanguages$.next(response);
      this.loading = false;
    });
  }

  handleFileUpload(event: BehaviorSubject<string | ArrayBuffer>): void {
    let fileContent = event.value as string;
    let cleanArray = this.fileService.cleanMultilineString(fileContent);
    // clear all controls, to rebuild form
    Object.keys(this.form.controls).forEach(control=> {
      this.form.removeControl(control);
    });

    this.dialogBoxes = [];
    this.dialogBoxId = 0;

    for (let individualSub of cleanArray) {
      this.addDialogBox(individualSub);
    }
  }

}

export function parseTimestamp(value: string): TimeFormat {
  const parts = value.split(':');
  const [seconds, milliseconds] = parts[2].split('.');
  
  const timeformatObject: TimeFormat = {
    hour: parseInt(parts[0], 10),
    minute: parseInt(parts[1], 10),
    seconds: parseInt(seconds, 10),
    ms: parseInt(milliseconds, 10)
  };
  
  return timeformatObject;
}

export function calculateSeconds(timeFormat: TimeFormat): number {
  return (timeFormat.hour * 60 * 60) + (timeFormat.minute * 60) + timeFormat.seconds + (timeFormat.ms/1000);
}


export function timeValidation(): ValidatorFn {
  return (group: FormGroup): ValidationErrors => {
    console.log(group)
    // const control1 = group.controls['myControl1'];
    // const control2 = group.controls['myControl2'];
    // if (control1.value !== control2.value) {
    //    control2.setErrors({notEquivalent: true});
    // } else {
    //    control2.setErrors(null);
    // }
    return;
};
}