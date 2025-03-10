## Weekend Project
*Homework of kvutien (KsHRM4) week 1*

To consolidate the knowledge acquired this week, students should complete the following project:

1. Create a new GitHub repository for your project. **DONE**
2. Invite all members of your group to collaborate on the repository. **DONE, made my own branch**
3. Write a simple README.md file explaining your project. **DONE**
4. Modify and expand the `Chef GPT script` (https://github.com/Encode-Club-AI-Bootcamp/DeAI/blob/main/Lesson-04/exercises/07-Chef-GPT.md) by incorporating a unique personality for your AI chef
   - Tweak the system prompt to include a unique personality for your AI chef
   - Example personalities:
     - A young, enthusiastic Indian chef specializing in Biryani. **DONE**
     - A seasoned Italian chef with a passion for pasta-making. **DONE**
     - An old Brazilian grandma who loves to cook classic dishes. **DONE**
5. Develop individual scripts for each group member, each featuring a distinct AI chef personality
6. Program the AI to respond to three specific types of user inputs:
   a. Ingredient-based dish suggestions
   b. Recipe requests for specific dishes
   c. Recipe critiques and improvement suggestions
7. Give enough instructions in the system prompt to make the AI conform to give the responses according to the scenarios above
   - Implement the following logic:
   - If the user's initial input doesn't match these scenarios, politely decline and prompt for a valid request.
     - For ingredient inputs: Suggest only dish names without full recipes.
     - For dish name inputs: Provide a detailed recipe.
     - For recipe inputs: Offer a constructive critique with suggested improvements.
   - Ideally, the same AI would be able to handle the three scenarios above
     - But if you can't get the same AI to do that, you can make three different scripts for each personality to proceed with your project

**Solution, System Prompt**: You are an AI specialized in culinary assistance. Respond to user inputs as follows:\nIngredient-based dish suggestions:\nIf the user lists ingredients, suggest dish names without providing full recipes.\nRecipe requests for specific dishes:\nIf the user asks for a recipe by dish name, provide a detailed recipe.\nRecipe critiques and improvement suggestions:\nIf the user provides a recipe, offer a constructive critique with suggested improvements.\nFor any other input, politely decline and request a valid input matching the scenarios above.

Tests done: "*what can I do with onions and mushrooms?*", "*Brazilian pork*", "*how can improve on an omelette?*"

8. Conduct a comprehensive experiment:
   - The first person should use one script with one personality to suggest a dish based on given ingredients
     - After running the script, send the response for one of your group members (via Discord or any other means)
   - The second person should request a recipe for that dish using a second script with a different personality
     - After running the script, send the response for another of your group members
   - The third person should critique the provided recipe using a third script with a different personality
9.  Compile a simple report documenting:
   - The experiment process
   - The system prompts used in each script
   - Comparative analysis of the different user prompts and their responses
10. Submit your completed project through the designated submission form.