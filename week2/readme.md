## week 2

1. I did the exercises of lesson 5 and 6.
2. I found that in the exercise 3 of lesson 6, the UI of Vercel has changed significantly from the lesson instructions: I had to "Add Product" that is Upstash for Redis. I have to give the environment variable OPENAI_API_KEY which I know, but the AUTH_SECRET value I discovered how to obtain it when reading the file .env.example of the nextjs.chat github.
3. I found that in step 4 of exercise 3, lesson 6, the `npm install` failed. Mistral AI identifies as a dependency mismatch between `"react-dom": "19.0.0-rc-45804af1-20241021"`, and `"drizzle-orm": "^0.34.0"`. It suggests using the command `npm install --legacy-peer-deps` to force the install. 
4. I deployed the nextjs-chat app on Vercel but the homepage requests a login and I don't know what login it is. I tried the AUTH_SECRET ket but this doesn't work. And I don't feel like giving my credential on a web page powered by a set of libraries that I don't know.
5. I installed Cursor and used it in the exercise of Lesson 5 and 6. I also tried it on a previous ETHGlobal hackathon project. I adopted it :)
6. I started the step 4 and 5 of the weekend homework.