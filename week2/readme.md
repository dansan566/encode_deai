## week 2

1. I did the exercises of lesson 5 and 6.
2. I found that in the exercise 3 of lesson 6, the UI of Vercel has changed significantly from the lesson instructions: I had to "Add Product" that is Upstash for Redis. I have to give the environment variable OPENAI_API_KEY which I know, but the AUTH_SECRET value I discovered how to obtain it when reading the file .env.example of the nextjs.chat github.
3. I found that in step 4 of exercise 3, lesson 6, the `npm install` failed. Mistral AI identifies as a dependency mismatch between `"react-dom": "19.0.0-rc-45804af1-20241021"`, and `"drizzle-orm": "^0.34.0"`. It suggests using the command `npm install --legacy-peer-deps` to force the install. 
4. I deployed the nextjs-chat app on Vercel but the homepage requests a login and I don't know what login it is. I tried the AUTH_SECRET ket but this doesn't work. And I don't feel like giving my credential on a web page powered by a set of libraries that I don't know.
5. I installed Cursor and used it in the exercise of Lesson 5 and 6. I also tried it on a previous ETHGlobal hackathon project. I adopted it :)
6. I started the step 4 and 5 of the weekend homework.
=======
## Weekend Project

To consolidate the knowledge acquired this week, students should complete the following project:

1. Create a GitHub repository for your project
2. Add all members of your group as collaborators
3. Create a README.md file with a description of your project
4. Create a new application from scratch using NextJS
5. Develop a page for generating jokes using AI
6. Add a feature for users to customize the Joke Parameters

   - Choose which parameters you'd like to offer your users
   - For example, allow users to select:
     - A topic from a list of options (work, people, animals, food, television, etc.)
     - A tone for the joke (witty, sarcastic, silly, dark, goofy, etc.)
     - The type of joke (pun, knock-knock, story, etc.)
     - The "temperature" (how much randomness/creativity to add to the joke)
   - Consider how you'll construct the prompt for the AI model to adhere to these parameters

7. After configuring the parameters, users should click a button to generate the joke, and the generated response must be displayed on the user's screen within the same page
8. Add a feature for the AI to evaluate if the generated jokes are "funny", "appropriate", "offensive", or other criteria you deem important
9. Experiment with different prompts and system instructions to optimize generalist AI models for "subjective" classification tasks like humor, appropriateness, offensiveness, etc.
10. Submit your project via the submission form

