from groq import Groq
import base64
import os
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def detect_fault(image_bytes):
    image_data = base64.b64encode(image_bytes).decode("utf-8")

    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}"
                        }
                    },
                    {
                        "type": "text",
                        "text": """You are a mechanical engineering expert.
Analyze this image of a mechanical component.

Return your response in this exact format:
FAULT TYPE: (crack / corrosion / wear / misalignment / normal)
CONFIDENCE: (high / medium / low)
LOCATION: (where on the part)
SEVERITY: (critical / moderate / minor)
EXPLANATION: (2-3 lines explaining what you see)
RECOMMENDATION: (what should be done)"""
                    }
                ]
            }
        ],
        max_tokens=1000
    )
    return response.choices[0].message.content
