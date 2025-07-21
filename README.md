PSOTGRESSQL+NODE.JS APP

TO RUN THIS APP --> node app.js

api endpoint --> http://localhost:3000/api/analyze-resume
payload (body-> raw->json) -->
{
"resumeText": "Mohd Arbaaz Siddiqui\nBackend Developer with experience in Node.js, PostgreSQL, Gemini API integration and building scalable REST APIs."
}

npm modules used

- express
- body-parser
- pg
- dotenv
- @google/generative-ai

type "npm install" to download all the dependencies

SUPABASE USE FOR POSTGRES(strucutred) DATA
all the postgres credentials are stored in .env

GEMINI API KEY USED for the app.
