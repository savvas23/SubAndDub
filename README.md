# SubAndDub

A helping platform to assist you with creating Subtitles for Youtube Videos, along with built-in translation tools and ChatGPT text manipulation.

## Required Configuration

To run this locally you will need a Firestore configuration for a schema and Storage bucket. If you want to utilize ChatGPT in subtitling you will need a valid API Key. Make sure to save these in your enviroment files and import them in the corresponding services to be used. Below is a step by step guide on how to set this up.
1. Create a local file in your project clone (Ideally an enviroments/enviroment.ts file, which is set up to not be tracked, but it can be anything) where you will store your API keys and Firebase configuration.
2. Create a Firebase project, in the project settings (Your Apps section) there will be a configuration code snippet called firebaseConfig that you can directly paste on the file you just created.
3. Create Google cloud project which will you provide you with an apiKey to access Google's services like YouTube Data and Google Translate etc...
4. Place all your required configuration and make them available to the rest of the project by using the keyword 'export' ( see screenshot below).
![image (4) (1)](https://github.com/savvas23/SubAndDub/assets/63872837/e6b69997-e31d-44be-8f9d-1d7461f70d35)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
