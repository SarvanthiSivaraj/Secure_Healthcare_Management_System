from langchain_core.prompts import PromptTemplate
from groq import Groq
import os
from dotenv import load_dotenv
import json

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def get_llm_response(messages, temperature=0.2, max_tokens=150):
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens
    )

    return completion.choices[0].message.content

SYMPTOM_EXTRACTION_PROMPT = """
Extract medical symptoms from the following patient message.

Rules:
• Return only symptoms
• Use concise symptom names
• Do not include explanations
• Return JSON list

Example output:
["headache", "dehydration"]

Patient message:
{input}
"""

def extract_symptoms_llm(message: str) -> list:
    messages = [
        {"role": "user", "content": SYMPTOM_EXTRACTION_PROMPT.format(input=message)}
    ]
    response = get_llm_response(messages, temperature=0.1, max_tokens=150)
    try:
        clean_text = response.replace("```json", "").replace("```", "").strip()
        symptoms = json.loads(clean_text)
        if not isinstance(symptoms, list):
            symptoms = []
    except Exception as e:
        print(f"Symptom extraction failed: {e}")
        symptoms = []
    return symptoms


TRIAGE_PROMPT_TEMPLATE = """You are a medical triage assistant.
Your goal is to gather symptoms and recommend a department.

RULES:
1. Ask direct questions only.
2. Never repeat the patient's statement.
3. Do not use phrases like:
   "Since you mentioned"
   "Given that"
   "Based on what you said"
4. Ask ONE question per message.
5. Keep responses under 20 words.
6. Ask maximum 5 questions.
7. Stop asking questions when enough symptoms are known.

Given context from medical guidelines:
{context}

Known symptoms so far:
{symptoms}

Conversation history:
{chat_history}

Patient message:
{input}

Assistant question:"""

TriagePrompt = PromptTemplate(
    input_variables=["context", "symptoms", "chat_history", "input"],
    template=TRIAGE_PROMPT_TEMPLATE
)


SOAP_PROMPT_TEMPLATE = """Based on the following conversation history between a patient and an AI pre-screening assistant, generate a SOAP summary.

Conversation History:
{chat_history}

Generate a valid JSON object with the following keys, and nothing else (no markdown blocks or preamble):
{{
  "subjective": "Patient symptoms and complaints described in the conversation.",
  "objective": "Observed or measurable information (e.g., duration of symptoms, severity stated).",
  "assessment": "Possible condition or risk category based on symptoms.",
  "plan": "Recommended next step.",
  "recommended_department": "The recommended medical department.",
  "confidence_score": 0.85
}}

IMPORTANT:
1. `confidence_score` must be a float between 0.0 and 1.0 representing your confidence in the department recommendation.
2. If `confidence_score` < 0.6, you MUST set `recommended_department` to "General Physician".
"""


SoapPrompt = PromptTemplate(
    input_variables=["chat_history"],
    template=SOAP_PROMPT_TEMPLATE
)


def parse_soap_response(response_text: str):
    try:
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)

        if "confidence_score" in data and "recommended_department" in data:
            if float(data["confidence_score"]) < 0.6:
                data["recommended_department"] = "General Physician"

        return data

    except Exception as e:
        print(f"Failed to parse SOAP JSON: {e}")

        return {
            "subjective": "Failed to generate summary.",
            "objective": "N/A",
            "assessment": "N/A",
            "plan": "Review conversation manually.",
            "recommended_department": "General Physician",
            "confidence_score": 0.0
        }