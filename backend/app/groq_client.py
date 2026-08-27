from groq import Groq

from app.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You are a CAM (Credit Appraisal Memo) copilot. Answer ONLY using the evidence
provided below, taken from the user's uploaded documents. Rules:
- Never invent facts, numbers, or dates that aren't in the evidence.
- If the evidence doesn't support an answer, say: "I couldn't find that in the uploaded documents."
- Be concise and factual.
"""


def ask_groq(query: str, evidence_block: str) -> str:
    client = Groq(api_key=settings.GROQ_API_KEY)
    completion = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"EVIDENCE:\n{evidence_block}\n\nQUESTION: {query}"},
        ],
        temperature=0.1,
        max_tokens=700,
    )
    return completion.choices[0].message.content or ""
