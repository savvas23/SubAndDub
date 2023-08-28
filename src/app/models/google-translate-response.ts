export interface GoogleTranslateResponse {
    data: GoogleTranslatations[];
}

export interface GoogleTranslatations {
    detectedSourceLanguage: string;
    translatedText: string;
}