import os
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Initialize the conversation with the base persona of the Bavarian chef
messages = [
    {
        "role": "system",
        "content": (
            "You are a young, enthusiastic Bavarian chef with a passion for Bavarian cuisine. "
            "You bring a warm, friendly tone, eager to share the secrets of Bavarian cooking, "
            "especially classics like pretzels, schnitzels, and sauerkraut. You are patient, "
            "encouraging, and focus on making traditional Bavarian cooking fun and accessible for beginners."
        )
    }
]

def handle_user_input(user_input):
    try:
        if "ingredient:" in user_input.lower():
            ingredients = user_input.split("ingredient:")[1].strip()
            if not ingredients:
                return "Grüß Gott! You want ingredient suggestions? Tell me what you have, and I'll give you some ideas!"
            messages.append(
                {
                    "role": "system",
                    "content": (
                        "Your client has provided ingredients and wants suggestions for dishes that can be made with them. "
                        "Do not provide a full recipe; suggest only names of dishes that could work with these ingredients."
                    )
                }
            )
            messages.append({"role": "user", "content": f"I have these ingredients: {ingredients}"})
            response = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
            return response.choices[0].message.content

        elif "recipe:" in user_input.lower():
            dish_name = user_input.split("recipe:")[1].strip()
            if not dish_name:
                return "Servus! Tell me which dish you'd like to make, and I'll share the recipe!"
            messages.append(
                {
                    "role": "system",
                    "content": (
                        "Your client has requested a recipe for a specific dish. Provide a detailed recipe including "
                        "ingredients, steps, and any useful tips. Be clear and precise."
                    )
                }
            )
            messages.append({"role": "user", "content": f"I want a recipe for {dish_name}"})
            response = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
            return response.choices[0].message.content

        elif "critique:" in user_input.lower():
            recipe_details = user_input.split("critique:")[1].strip()
            if not recipe_details:
                return "Hello! Show me your recipe, and I'll give you my honest feedback!"
            messages.append(
                {
                    "role": "system",
                    "content": (
                        "Your client has provided a recipe for critique. Offer constructive feedback, focusing on ways to "
                        "improve flavor, texture, or presentation, and suggest any alternative ingredients or techniques."
                    )
                }
            )
            messages.append({"role": "user", "content": f"Here's my recipe: {recipe_details}"})
            response = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
            return response.choices[0].message.content

        else:
            return "I'm here to help with ingredient suggestions, specific recipes, or critiques. Please specify your request as 'ingredient:', 'recipe:', or 'critique:'."

    except Exception as e:
        return f"An error occurred: {e}"

if __name__ == "__main__":
    print("Welcome to the Bavarian Chef AI!")
    print("Please enter one of the following commands to interact:")
    print("- 'ingredient: [list of ingredients]' to get dish suggestions based on ingredients.")
    print("- 'recipe: [dish name]' to get a detailed recipe for a specific dish.")
    print("- 'critique: [your recipe details]' to get constructive feedback on your recipe.")
    user_input = input("Enter your request: ")
    print("Response from the Bavarian Chef:")
    print(handle_user_input(user_input))