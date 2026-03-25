"""
Recommendation Agent — suggests stocks based on user portfolio and market data.
"""
import os
import logging
from ..tools import get_sector_top_performers, get_user_portfolio, calculate_portfolio_risk

logger = logging.getLogger(__name__)


def _llm_recommend(query: str, context: str, api_key: str) -> str:
    try:
        from langchain_groq import ChatGroq
        from langchain.prompts import ChatPromptTemplate

        llm = ChatGroq(model='llama-3.3-70b-versatile', api_key=api_key, temperature=0.7)
        prompt = ChatPromptTemplate.from_messages([
            ('system', (
                "You are Zeus AI, a seasoned financial advisor for Indian and Global (US) markets (developed by Zeus-Group-8). "
                "Identity: Confident, sharp, data-driven, and personalized. You provideinstitutional-grade stock recommendations. "
                "Rules:\n"
                "1. Always explain the WHY (fundamentals, technicals, sector momentum).\n"
                "2. Mention sector diversification and risk concentration based on user portfolio context.\n"
                "3. Use ₹ for Indian stocks and $ for US stocks. Mention currency risk for US entries.\n"
                "4. Be direct: suggest a path, don't just say 'it depends'.\n"
                "5. Disclaimer: 'Informational purposes only — please consult a certified financial advisor. Zeus is not SEBI-registered.'\n"
                "6. Length: Under 250 words. Use emojis.\n\n"
                "Market & Portfolio Context:\n{context}"
            )),
            ('human', '{query}')
        ])
        chain = prompt | llm
        result = chain.invoke({'query': query, 'context': context})
        return result.content.strip()
    except Exception as e:
        logger.warning(f"Groq recommendation failed: {e}")
        return None


def run(query: str, user_id: int | None = None) -> dict:
    """
    Generate stock recommendations.
    Returns: { 'response': str, 'intent': 'recommendation' }
    """
    q = query.lower()
    portfolio = get_user_portfolio(user_id) if user_id else []
    risk = calculate_portfolio_risk(portfolio)

    # Determine sector focus from query
    sector = 'it'
    if any(k in q for k in ['bank', 'finance', 'financial']):
        sector = 'banking'
    elif any(k in q for k in ['pharma', 'health', 'medicine']):
        sector = 'pharma'
    elif any(k in q for k in ['energy', 'oil', 'power', 'reliance']):
        sector = 'energy'
    elif any(k in q for k in ['us', 'american', 'nasdaq', 's&p']):
        sector = 'us'

    top = get_sector_top_performers(sector)

    # Build context for LLM
    portfolio_summary = ""
    if portfolio:
        symbols = [p['symbol'] for p in portfolio[:5]]
        portfolio_summary = f"User holds: {', '.join(symbols)}. Risk: {risk['risk_level']}."
    elif user_id:
        portfolio_summary = "User is logged in but their Vault is currently empty."

    # Format currency dynamically based on stock symbol for the list
    def _fmt(s):
        curr = '₹' if '.NS' in s['symbol'] or '.BO' in s['symbol'] else '$'
        return f"  • **{s['symbol'].replace('.NS','')}**: {curr}{s['price']} ({s['change_pct']:+.1f}%)"

    top_summary = "\n".join([_fmt(s) for s in top])
    context = f"{portfolio_summary}\nTop {sector.upper()} performers:\n{top_summary}"

    api_key = os.environ.get('GROQ_API_KEY')
    llm_response = _llm_recommend(query, context, api_key) if api_key else None

    if llm_response:
        return {'response': llm_response, 'intent': 'recommendation'}

    # — Fallback: structured response —
    is_risk_query = any(k in q for k in ['risk', 'diversif', 'level', 'safe'])

    if is_risk_query and portfolio:
        response = (
            f"📊 **Portfolio Risk Analysis**\n\n"
            f"Risk Level: **{risk['risk_level']}** (Score: {risk['score']}/100)\n"
            f"Diversification: {risk['diversification']} sector(s) — {', '.join(risk['sectors'])}\n\n"
            f"{risk['message']}\n\n"
            f"💡 *Tip: Aim for 5+ sectors to lower risk.*"
        )
    elif portfolio:
        held = [p['symbol'].replace('.NS', '') for p in portfolio[:3]]
        response = (
            f"🌟 **Top {sector.upper()} Picks for You**\n\n"
            + top_summary.replace('  • ', '')
            + f"\n\n📌 You already hold: {', '.join(held)}.\n"
            f"💡 *Consider diversifying into {sector.upper()} to balance your portfolio.*"
        )
    elif user_id:
        response = (
            f"🌟 **Top {sector.upper()} Stocks Right Now**\n\n"
            + top_summary.replace('  • ', '')
            + "\n\n💡 *I see your Vault is empty. Start adding stocks to get personalized performance recommendations!*"
        )
    else:
        response = (
            f"🌟 **Top {sector.upper()} Stocks Right Now**\n\n"
            + top_summary.replace('  • ', '')
            + "\n\n💡 *Log in to get personalized recommendations based on your portfolio.*"
        )

    return {'response': response, 'intent': 'recommendation'}
