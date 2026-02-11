import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    response = requests.get(url)
    response.raise_for_status()
    models = response.json().get('models', [])
    with open("models_list.txt", "w") as f:
        for model in models:
            f.write(f"NAME: {model['name']}\n")
            f.write(f"METHODS: {model['supportedGenerationMethods']}\n")
            f.write("---\n")
    print("Models saved to models_list.txt")
except Exception as e:
    print(f"Error listing models: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Response: {e.response.text}")
