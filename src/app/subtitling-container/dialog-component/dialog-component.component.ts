import { Component, EventEmitter, Input, OnInit,Output,ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, of, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs';
import { DialogBox } from 'src/app/models/general/dialog-box.model';
import { GoogleTranslateRequestObject } from 'src/app/models/google/google-translate-request';
import { ImportModel } from 'src/app/models/general/import-sbv.model';
import { GoogleTranslateService } from 'src/app/services/googletranslate.service';
import { UploadFileHandlerService } from 'src/app/services/upload-file-handler.service';
import { GoogleTranslateResponse, GoogleTranslations, ResponseObject} from 'src/app/models/google/google-translate-response'
import { SupportedLanguages } from 'src/app/models/google/google-supported-languages';
import { TimeFormat } from 'src/app/models/general/time-format.model';
import { TimeEmitterObject } from './dialog-content/dialog-content.component';
import { calculateSeconds, parseTimestamp } from 'src/app/shared/functions/shared-functions';
import { PersonAssign } from 'src/app/models/general/person-assign.model';
import { MatDialog } from '@angular/material/dialog';
import { PersonCreationDialogComponent } from 'src/app/components/dialog-modal/person-creation-dialog/person-creation-dialog/person-creation-dialog.component';
import { TextContentToSSML } from 'src/app/models/general/gpt-feed.model';
import { GenerateVoiceDialogComponent } from 'src/app/components/dialog-modal/generate-voice-modal/genereate-voice-modal.component';
import { TextToSpeechService } from 'src/app/services/text-to-speech-service.service';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'dialog-component',
  templateUrl: './dialog-component.component.html',
  styleUrls: ['./dialog-component.component.css'],
  providers: [UploadFileHandlerService, GoogleTranslateService, StorageService]
})
export class DialogComponentComponent implements OnInit {
  public dialogBoxId: number = 1;
  public _supportedLanguages$: BehaviorSubject<SupportedLanguages> = new BehaviorSubject<SupportedLanguages>(null);
  public _translatedText$: BehaviorSubject<GoogleTranslateResponse> = new BehaviorSubject<GoogleTranslateResponse>(null);
  public subtitles$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public currentSelectedLanguage: string;
  protected loading: boolean;
  public form: FormGroup;
  public persons: PersonAssign[];
  @Input() initSubtitles: boolean = true;
  @Input() subtitleName: string;
  @Input() videoId: string;
  @Input() isoCode: string;
  @Output() subtitleUploadEmitter: EventEmitter<Blob> = new EventEmitter<Blob>();
  @Output() formStatusChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() navigateTTS: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('translateMenu') translateMenu;

  public dialogBoxes: DialogBox[] = [{
    id: 1,
    text: '',
    start_time: '',
    end_time: ''
  }];

  get supportedLanguages$(): Observable<SupportedLanguages> {
    return this._supportedLanguages$;
  }

  constructor(private fb: FormBuilder,
    private fileService: UploadFileHandlerService,
    private storage: StorageService,
    private google: GoogleTranslateService,
    public dialog: MatDialog,
    private ttsService: TextToSpeechService
    ) {}

  ngOnInit(): void {
    if (this.initSubtitles) {
      this.storage.getSubtitleURL(this.videoId, this.isoCode, this.subtitleName).pipe(take(1)).subscribe(url => {
        if (url) {
          this.storage.fetchSubtitleFile(url).subscribe((res: string) => {
            this.subtitles$.next(res)
            this.handleFileUpload(this.subtitles$);
          })
        }
      });
    }

    this.form = this.fb.group({
      '1-dialogBox': this.fb.group({
        subtitles: this.fb.control(''),
        start_time: this.fb.control('00:00:00.000'),
        end_time: this.fb.control('00:00:02.000'),
        })
    });
    // Subscribe to form status changes
    this.form.statusChanges.pipe().subscribe(() => {
      const isDirty = this.form.dirty;
      if (isDirty) {
        this.formStatusChange.emit(isDirty);
      }
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
      id: this.dialogBoxId,
      text: value?.subtitleText,
      start_time: value?.start_time,
      end_time: value?.end_time
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
      currentGroup.get('end_time').setErrors({higherStartTime:true});
    } else {
      currentGroup.get('end_time').setErrors(null);
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

  translateAllSubtitles(targetLanguage: string): void {
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

  translateSingleSubtitle(targetLanguage: {lang: string, id: number}): void {
    let translationObject: GoogleTranslateRequestObject = {
      q: [this.form.get(targetLanguage.id + '-dialogBox').get('subtitles').value],
      target: targetLanguage.lang
    };

    this.google.translate(translationObject).subscribe((response: ResponseObject) => {
      if (response) {
        this.form.get(targetLanguage.id + '-dialogBox').get('subtitles').setValue(response.data.translations[0].translatedText);
      }

    })

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

  openPersonCreationModal(): void {
    this.dialog.open(PersonCreationDialogComponent, {'width': '500px', data: this.persons}).afterClosed()
    .subscribe((data: PersonAssign[]) => {
      if (data) this.persons = data;
    });
  }

  uploadSubtitle(): void {
    this.subtitleUploadEmitter.emit(this.createSubtitleBlob());
 
  }

  createSubtitleBlob(): Blob {
    let sbvContent = ''
    Object.keys(this.form.controls).forEach((control) => {
      const currentGroup = this.form.get(control);
      sbvContent += `${currentGroup.get('start_time').value},${currentGroup.get('end_time').value}\n${currentGroup.get('subtitles').value}\n\n`;
    });
    const blob = new Blob([sbvContent], { type: 'text/sbv;charset=utf8'});
    return blob;
  }

  downloadSubtitle(): void {
    const blob = this.createSubtitleBlob()
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.sbv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  handleFileUpload(event: BehaviorSubject<string | ArrayBuffer>): void {
    let fileContent = event.value as string;
    let cleanArray = this.fileService.cleanMultilineString(fileContent);
    // clear all controls, to rebuild form
    Object.keys(this.form.controls).forEach(control=> {
      this.form.removeControl(control);
    });

    this.dialogBoxes = [];
    this.dialogBoxId = 1;

    for (let individualSub of cleanArray) {
      this.addDialogBox(individualSub);
    }
  }

  generateSpeechInit(): void {
    this.dialog.open(GenerateVoiceDialogComponent,{width:'500px'}).afterClosed().subscribe((res: boolean)=> {
      if (res) {
        let contentToSpeech: TextContentToSSML[] = [];
        Object.keys(this.form.controls).forEach(control => {
        const startTime = parseTimestamp(this.form.get(control).get('start_time').value)
        const endTime = parseTimestamp(this.form.get(control).get('end_time').value)

        const controlContent: TextContentToSSML = {
          text: this.form.get(control).get('subtitles').value,
          totalDuration: Math.floor((calculateSeconds(endTime) - calculateSeconds(startTime)) * 1000) + 'ms',
          start_time: this.form.get(control).get('start_time').value,
          end_time: this.form.get(control).get('end_time').value
        };
        contentToSpeech.push(controlContent);
        });
        this.ttsService.set_initContentSSML(contentToSpeech);
        this.navigateTTS.emit();
      }
    });
  }

}

export interface UploadSubtitle {
  content: Blob;
  file_name: string
}