import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GoogleTranslateRequestObject } from 'src/app/models/google/google-translate-request';
import { GOOGLE_API_KEY } from 'src/config';

@Injectable()
export class GoogleTranslateService {
  constructor(private http: HttpClient) { }

  translate(translationObject: GoogleTranslateRequestObject) {
    const url = 'https://translation.googleapis.com/language/translate/v2?key=';
    const key = GOOGLE_API_KEY;
    return this.http.post(url + key, translationObject);
  }

  getSupportedLanguages() {
    const url = `https://translation.googleapis.com/language/translate/v2/languages?target=en&key=${GOOGLE_API_KEY}`;
    return this.http.get(url);
  }

}

