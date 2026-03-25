"""
Intent classifier — routes queries to one of 4 agents.
Uses LangChain + Gemini when API key is available, else rule-based.
"""
import re
import os
import logging

logger = logging.getLogger(__name__)


def _rule_based_classify(query: str) -> str:
    """Fast rule-based fallback classifier."""
    q = query.lower()

    portfolio_verbs = ['add', 'remove', 'delete', 'buy', 'sell', 'include', 'exclude', 'put']
    portfolio_nouns = ['portfolio', 'stock', 'stocks', 'share', 'shares', 'position', 'holdings']

    if any(v in q for v in portfolio_verbs) and any(n in q for n in portfolio_nouns):
        return 'portfolio'

    recommend_kw = ['suggest', 'recommend', 'which stock', 'what should i', 'best stock',
                    'good investment', 'risk level', 'risk', 'diversif', 'top stock',
                    'what to buy', 'invest in']
    if any(k in q for k in recommend_kw):
        return 'recommendation'

    forecast_kw = ['predict', 'forecast', 'future', 'next week', 'next month', 'will it go',
                   'market prediction', 'trend', 'bull', 'bear', 'where is market',
                   'market outlook', 'expected', 'projection']
    if any(k in q for k in forecast_kw):
        return 'forecasting'

    return 'qa'


def classify_intent(query: str, user_id: int | None = None) -> str:
    """
    Classify the user's intent into one of:
    - recommendation
    - portfolio
    - qa
    - forecasting
    Uses Gemini LLM if GOOGLE_API_KEY is set, else rule-based.
    """
    api_key = os.environ.get('GROQ_API_KEY')

    if api_key:
        try:
            from langchain_groq import ChatGroq
            from langchain.prompts import ChatPromptTemplate

            llm = ChatGroq(
                model='llama3-8b-8192',
                api_key=api_key,
                temperature=0
            )
            prompt = ChatPromptTemplate.from_messages([
                ('system', (
                    "You are the orchestration engine for Zeus AI, a seasoned financial advisor platform (Zeus-Group-8). "
                    "Your personality is sharp, data-driven, and institutional-grade. "
                    "Classify the user message into EXACTLY ONE of these intents:\n"
                    "- recommendation: user wants stock picks, better investments, or portfolio risk analysis\n"
                    "- portfolio: user wants to add, remove, or manage specific holdings in their Vault\n"
                    "- forecasting: user wants market outlooks, price predictions, or trend analysis\n"
                    "- qa: general finance knowledge, PE concepts, ELSS, gold/silver advice, or market news\n\n"
                    "Reply with ONLY the intent word."
                )),
                ('human', '{query}')
            ])
            chain = prompt | llm
            result = chain.invoke({'query': query})
            intent = result.content.strip().lower()
            if intent in ('recommendation', 'portfolio', 'forecasting', 'qa'):
                logger.info(f"Groq classified '{query[:50]}' as '{intent}'")
                return intent
        except Exception as e:
            logger.warning(f"LLM classification failed: {e}, falling back to rule-based")

    intent = _rule_based_classify(query)
    logger.info(f"Rule-based classified '{query[:50]}' as '{intent}'")
    return intent
