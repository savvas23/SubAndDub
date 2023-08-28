import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { GoogleTranslateRequestObject } from 'src/app/models/google-translate-request';
import { GTRANSLATE_API_KEY } from 'src/config';

@Injectable({
  providedIn: 'root'
})
export class GoogleTranslateService {
  constructor(private http: HttpClient) { }

  translate(translationObject: GoogleTranslateRequestObject) {
    const url = 'https://translation.googleapis.com/language/translate/v2?key=';
    const key = GTRANSLATE_API_KEY;
    return this.http.post(url + key, translationObject);
  }

  getSupportedLanguages() {
    const url = `https://translation.googleapis.com/language/translate/v2/languages?target=en&key=${GTRANSLATE_API_KEY}`;
    return this.http.get(url);
  }

}

