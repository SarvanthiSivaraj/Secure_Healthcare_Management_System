from triage_engine import get_llm
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

def generate_soap(conversation):
    llm = get_llm(model_name="phi3", temperature=0.0)

    prompt_template = """
    Convert this patient conversation into a medical SOAP summary.

    Conversation:
    {conversation}

    Format:

    Subjective:
    Objective:
    Assessment:
    Plan:
    """

    prompt = PromptTemplate(
        input_variables=["conversation"],
        template=prompt_template
    )

    chain = prompt | llm | StrOutputParser()
    response = chain.invoke({"conversation": conversation})

    return response