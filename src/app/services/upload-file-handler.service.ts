import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ImportModel } from 'src/app/models/general/import-sbv.model';

@Injectable()
export class UploadFileHandlerService {

  constructor() { }

  cleanMultilineString(input: string): ImportModel[] {
    const lines = input.trim().replace(/(\r|\r)/gm, '').split('\n');

    const subtitleObjects = [];
    let currentSubtitle: ImportModel = {start_time: '', end_time:'', subtitleText:''};
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const timestampRegex = /^(\d{1,2}:\d{2}:\d{2}\.\d{3}),(\d{1,2}:\d{2}:\d{2}\.\d{3})$/;

      if (line.match(timestampRegex)) {
        const [startTime, endTime] = line.split(",");
        currentSubtitle = { 
          start_time: this.formatTimestamp(startTime), 
          end_time: this.formatTimestamp(endTime), 
          subtitleText: ""
         };
        subtitleObjects.push(currentSubtitle);
      } else if (line !== "") {
        currentSubtitle.subtitleText += line + ' ';
      }
    }
    return subtitleObjects;
  }

  formatTimestamp(timestamp: string): string {
    const parts = timestamp.split(':');
    for (let i = 0; i < parts.length; i++) {
        if (parts[i]?.length === 1) {
            parts[i] = '0' + parts[i];
        }
    }
    return parts.join(':');
  }
}
