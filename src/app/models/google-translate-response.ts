export interface GoogleTranslateResponse {
    data: GoogleTranslations[];
}

export interface GoogleTranslations {
    detectedSourceLanguage: string;
    translatedText: string;
}