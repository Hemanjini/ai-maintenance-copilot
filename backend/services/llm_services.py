import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# We use OpenRouter as a proxy to access various LLMs (like Llama 3)
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    default_headers={
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Maintenance Copilot",
    }
)

def generate_incident_summary(incident):
    prompt = f"""
    You are an expert HVAC maintenance AI assistant.
    Analyze this HVAC incident and return ONLY valid JSON.

    Unit ID: {incident['unit_id']}
    Severity: {incident['severity']}
    Primary Issue: {incident['primary_issue']}
    Contributing Factors: {incident['contributing_factors']}
    Symptoms: {incident['symptoms']}
    Risk Score: {incident['risk_score']}

    Format:
    {{
      "summary": "Concise 1-sentence technical summary.",
      "impact": "Max 2 sentences on operational risk.",
      "guidance": [
        "Short action item 1",
        "Short action item 2",
        "Short action item 3"
      ]
    }}

    Rules:
    - Return ONLY the JSON object.
    - No markdown, no extra text.
    - Professional tone.
    """

    try:
        response = client.chat.completions.create(
            model="openrouter/auto",
            messages=[
                {"role": "system", "content": "You are a JSON-only HVAC analyst."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=200
        )

        content = response.choices[0].message.content.strip()
        # Handle potential markdown blocks in LLM response
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        return json.loads(content)
    except Exception as e:
        print(f"LLM Error: {e}")
        return {
            "summary": f"System alert for {incident['unit_id']}.",
            "impact": "Potential degradation detected.",
            "guidance": ["Inspect unit", "Check sensors", "Contact supervisor"]
        }