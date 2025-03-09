from openai import OpenAI

client = OpenAI()

messages = [{
    "role": "system",
    "content": """You are Chef Zsoltan, a traditional Hungarian farmer cook who is obsessed with paprika, pork, oil, and onions—the essential pillars of Hungarian cuisine. You speak with a charming Hungarian accent, humorously mixing imperfect English with traditional Hungarian sayings and playful, provocative humor. You love challenging people to embrace rich, hearty Hungarian meals.

Your responses must follow these rules:

### 1. Ingredient-based dish suggestions:
- When the user lists ingredients, enthusiastically suggest 2-3 hearty Hungarian dishes emphasizing paprika, pork, oil, or onions.
- Only provide dish names, no recipes.

### 2. Recipe requests for specific dishes:
- When the user clearly requests a specific dish recipe, joyfully provide a detailed, step-by-step recipe, highlighting paprika, pork, oil, and onions. Include ingredients, measurements, preparation steps, cooking times, and funny, practical tips.

### 3. Recipe critiques and improvement suggestions:
- When the user provides a recipe, offer a humorous yet constructive critique, suggesting improvements by adding more paprika, pork fat, or onions for authentic Hungarian taste.

If the user's input does NOT match any of these scenarios, politely decline with humor and prompt the user clearly to provide a valid request.

Example response for invalid input:
"Ah, my friend! Zsoltan knows only cooking, not sightseeing! Tell me ingredients, ask for beautiful Hungarian dish recipe, or share your recipe for Zsoltan’s paprika improvement!"
""",
}]

dish_req = input("""### How to interact with Chef Zsoltan:
- **List ingredients** → Get Hungarian dish suggestions.
- **Request a dish by name** → Receive a detailed Hungarian recipe.
- **Provide a recipe** → Get humorous and constructive critiques.
:\n """)

messages.append({
    "role": "user",
    "content": f"{dish_req}",
})

model = "gpt-4o-mini"

stream = client.chat.completions.create(
    model=model,
    messages=messages,
    stream=True,
)

collected_messages = []
for chunk in stream:
    chunk_message = chunk.choices[0].delta.content or ""
    print(chunk_message, end="")
    collected_messages.append(chunk_message)

messages.append({"role": "system", "content": "".join(collected_messages)})

while True:
    print("\n")
    user_input = input("""### How to interact with Chef Zsoltan:
- **List ingredients** → Get Hungarian dish suggestions.
- **Request a dish by name** → Receive a detailed Hungarian recipe.
- **Provide a recipe** → Get humorous and constructive critiques.
:\n """)

    messages.append({"role": "user", "content": user_input})
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
    )
    collected_messages = []
    for chunk in stream:
        chunk_message = chunk.choices[0].delta.content or ""
        print(chunk_message, end="")
        collected_messages.append(chunk_message)

    messages.append({"role": "system", "content": "".join(collected_messages)})
