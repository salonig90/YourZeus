"""
General Q&A Agent — answers finance questions.
Uses ChromaDB for memory + Gemini LLM with fallback to structured FAQ responses.
"""
import os
import logging
from ..tools import get_live_stock_price, get_market_news_summary, extract_all_stock_symbols

logger = logging.getLogger(__name__)

FINANCE_KNOWLEDGE = {
    'zeus': (
        "⚡ **Zeus AI — Your Institutional Intelligence**\n\n"
        "I am not a basic assistant. I am **Zeus AI**, a seasoned financial engine "
        "developed by **Zeus-Group-8**. I think like a Wall Street analyst and "
        "advise with institutional-grade precision.\n\n"
        "**My Core Capabilities:**\n"
        "• **Direct Advice:** Clear Buy/Hold/Sell signals based on technicals.\n"
        "• **Multi-Market:** Native support for NSE/BSE (₹) and Global US ($) stocks.\n"
        "• **ML Insights:** K-Means clustering and PE-ratio trend analysis.\n"
        "• **Personalization:** Tailored advice based on your current portfolio (Vault).\n\n"
        "💡 *Go to the 'Stocks' or 'Metals' page for live dashboards.*"
    ),
    'pe ratio': (
        "📊 **P/E Ratio — Value vs. Growth**\n\n"
        "Price-to-Earnings measures what you pay for every ₹1 (or $1) a company earns.\n"
        "• **Lower PE (<15):** Potentially undervalued — 'Value' territory.\n"
        "• **High PE (>35):** Markets expect explosive growth — 'Growth' territory.\n"
        "• I provide 12-month historical PE charts on your **Portfolio (Vault)** page.\n\n"
        "💡 *Reasoning: Don't look at PE in isolation. Compare it to the sector average.*"
    ),
    'k-means': (
        "🎯 **K-Means Clustering — ML Diversification**\n\n"
        "Zeus uses K-Means to group stocks by price and daily change %.\n"
        "• 🟢 **High Growth:** Strong upward momentum (>5%).\n"
        "• 🟡 **Stable:** Low volatility / Consolidating (-2% to 5%).\n"
        "• 🔴 **Declining:** Downward pressure (<-2%).\n\n"
        "💡 *Advice: If all your stocks are in one cluster, you aren't diversified.*"
    ),
    'elss': (
        "🛡️ **ELSS — Tax Saving (Section 80C)**\n\n"
        "Equity Linked Savings Schemes are the best tax-savers for long-term growth.\n"
        "• **Lock-in:** 3 years (shortest among 80C options).\n"
        "• **Tax Benefit:** Deduction up to ₹1.5L.\n"
        "• **Expectation:** High equity risk, but superior long-term returns.\n\n"
        "💡 *Zeus Pick: Use an index-based ELSS to combine tax safety with low costs.*"
    ),
    'gold': (
        "🥇 **Gold — The Inflation Hedge**\n\n"
        "Gold protects your purchasing power when the USD is weak or inflation is high.\n"
        "• Live tracking on our **Metals** page (refreshed every 30 seconds).\n"
        "• Correlation: We analyze how gold and silver move together.\n\n"
        "💡 *Advisor Tip: Maintain 5-10% of your portfolio in metals for stability.*"
    ),
    'vault': (
        "🏛️ **The Vault (Portfolio)**\n\n"
        "Your command center once you login. It surfaces deep ML insights:\n"
        "• **Historical PE Trends** across 12 months.\n"
        "• **Portfolio Clustering** for risk assessment.\n"
        "• **Concentration Alerts:** Flags when one sector exceeds 30% exposure.\n\n"
        "💡 *Add stocks via the 'Stocks' page or by asking me!*"
    ),
    'signup': (
        "🔗 **How to Sign Up on Zeus**\n\n"
        "To get personalized portfolio tracking and ML insights, follow these steps:\n"
        "1. Click the **SIGNUP** button in the top navigation bar.\n"
        "2. Provide your Name, Email, Username, and Password.\n"
        "3. **Crucial:** You must set a 4-digit **MPIN**. This secures your Vault and is required before any stock transactions.\n"
        "4. (Optional) Provide your Telegram Username for OTP recovery.\n\n"
        "💡 *Signup takes less than a minute! Once done, log in to unlock your Vault.*"
    ),
    'login': (
        "🔗 **Platform Access (Signup/Login)**\n\n"
        "To access your portfolio and get ML insights:\n"
        "1. Click **LOGIN** in the top navigation bar.\n"
        "2. Enter your credentials.\n"
        "3. Once authenticated, your Vault (Portfolio) will be unlocked.\n\n"
        "💡 *Log in to enable personalized recommendations from Zeus AI.*"
    ),
    'register': (
        "🔗 **How to Register on Zeus**\n\n"
        "To get personalized portfolio tracking and ML insights, follow these steps:\n"
        "1. Click the **SIGNUP** button in the top navigation bar.\n"
        "2. Provide your Name, Email, Username, and Password.\n"
        "3. **Crucial:** You must set a 4-digit **MPIN**. This secures your Vault and is required before any stock transactions.\n"
        "4. (Optional) Provide your Telegram Username for OTP recovery.\n\n"
        "💡 *Signup takes less than a minute! Once done, log in to unlock your Vault.*"
    ),
    'indian market': (
        "📊 **Indian Market Dynamics (NSE/BSE)**\n\n"
        "Zeus focuses on the Nifty 200 constituents across 15+ sectors.\n"
        "• All calculations for Indian stocks use **INR (₹)**.\n"
        "• We provide specific Buy/Hold/Sell signals on sector pages.\n\n"
        "💡 *Navigate to /stocks to browse sectors like Banking or Pharma.*"
    ),
    'us market': (
        "Global technology leaders like NVIDIA, Apple, and Tesla are tracked in **USD ($)**.\n"
        "• Note: Indian investors face currency risk (USDINR volatility).\n"
        "• Sentiment for US stocks is weighted against global financial news.\n\n"
        "💡 *Ideal for geographical diversification alongside your Indian core.*"
    ),
}


def _llm_answer(query: str, api_key: str, context: str = '') -> str | None:
    try:
        from langchain_groq import ChatGroq
        from langchain.prompts import ChatPromptTemplate

        llm = ChatGroq(model='llama-3.3-70b-versatile', api_key=api_key, temperature=0.5)
        prompt = ChatPromptTemplate.from_messages([
            ('system', (
                "You are Zeus AI, a seasoned financial advisor embedded in the Zeus platform (developed by Zeus-Group-8). "
                "Identity: Sharp, data-driven, confident, and professional — like a Wall Street analyst. "
                "Rules:\n"
                "1. Reason and compare. Never just list facts. Give clear 'Winners' with rationale.\n"
                "2. Personalization: If context mentions the user's portfolio, reference their holdings directly.\n"
                "3. Currency: Default to ₹ for Indian stocks and $ for US Stocks. Mention currency risk for US stocks.\n"
                "4. Knowledge: Be expert in PE Ratios, K-Means Clustering, Sector Momentum, and ELSS Tax Saving (80C).\n"
                "5. Platform Guidance: Refer users to '/stocks' for browsing, '/gold-silver' for metals charts, and '/portfolio' (Vault) for ML insights.\n"
                "6. Disclaimer: Always add: 'Informational purposes only — please consult a certified financial advisor before investing. Zeus is not SEBI-registered.'\n"
                "7. Length: Under 250 words. Use emojis for readability. Be direct and actionable.\n\n"
                "Additional User Context (Portfolio etc):\n{context}"
            )),
            ('human', '{query}')
        ])
        chain = prompt | llm
        result = chain.invoke({'query': query, 'context': context})
        return result.content.strip()
    except Exception as e:
        logger.warning(f"Groq Q&A failed: {e}")
        return None


def run(query: str, user_id: int | None = None) -> dict:
    """Answer a general finance question."""
    q = query.lower()

    # Handle greetings
    greetings = ['hi', 'hello', 'hey', 'hii', 'hy', 'namaste', 'greeting', 'gud morning', 'good morning', 'good evening']
    if any(q == k or q.startswith(k + ' ') or q.endswith(' ' + k) for k in greetings):
        return {
            'response': (
                "👋 **Greetings! I am Zeus AI.**\n\n"
                "I am your seasoned financial advisor, powered by **Zeus-Group-8**. "
                "I'm ready to analyze markets, compare stocks, or review your portfolio.\n\n"
                "**How can I assist your wealth-building journey today?**\n"
                "• *\"Compare TCS vs Infosys\"*\n"
                "• *\"Suggest some mid-cap stocks\"*\n"
                "• *\"Explain PE Ratio simply\"*"
            ),
            'intent': 'qa'
        }

    # Check for stock price or comparison query
    symbols = extract_all_stock_symbols(query)
    if symbols:
        price_hits = []
        for s in symbols:
            data = get_live_stock_price(s)
            currency = '₹' if '.NS' in s else '$'
            price_hits.append({
                'symbol': s,
                'price': f"{currency}{data['price']:,.2f}",
                'change': f"{data['change_pct']:+.1f}%"
            })
            
        if any(k in q for k in ['price', 'how much', 'cost', 'worth', 'trading', 'what is', 'compare', 'vs', 'versus']):
            if len(price_hits) > 1:
                response = "📊 **Stock Comparison**\n\n"
                for p in price_hits:
                    response += f"• **{p['symbol'].replace('.NS','')}**: {p['price']} ({p['change']})\n"
                response += "\n💡 *Zeus provides institutional-grade sector analysis on the 'Sector Stocks' page.*"
                return {'response': response, 'intent': 'qa'}
            elif len(price_hits) == 1:
                p = price_hits[0]
                response = (
                    f"📈 **{p['symbol'].replace('.NS', '')} Live Price**\n\n"
                    f"Price: **{p['price']}**\n"
                    f"Change: {p['change']} today\n"
                )
                return {'response': response, 'intent': 'qa'}

    # Check for news query
    if any(k in q for k in ['news', 'today', 'latest', 'update', 'market today']):
        news = get_market_news_summary()
        response = f"📰 **Market News — {__import__('datetime').datetime.now().strftime('%d %b %Y')}**\n\n{news}"
        return {'response': response, 'intent': 'qa'}

    # Try knowledge base (sort by length descending to match longest/most specific topics first)
    sorted_topics = sorted(FINANCE_KNOWLEDGE.keys(), key=len, reverse=True)
    for topic in sorted_topics:
        # Require word boundaries for short topics like "zeus"
        import re
        if re.search(rf"\b{re.escape(topic)}\b", q):
            return {'response': FINANCE_KNOWLEDGE[topic], 'intent': 'qa'}

    # Try LLM
    api_key = os.environ.get('GROQ_API_KEY')
    if api_key:
        llm_resp = _llm_answer(query, api_key)
        if llm_resp:
            return {'response': llm_resp, 'intent': 'qa'}

    # Final fallback
    out_of_scope_kw = ['recipe', 'movie', 'game', 'sport', 'football', 'cricket score', 'weather']
    if any(k in q for k in out_of_scope_kw):
        return {
            'response': (
                "🎯 **Out of Scope**\n\n"
                "I specialise in finance. Let me help you with:\n"
                "• Stock analysis & recommendations\n"
                "• Mutual funds & portfolio management\n"
                "• Gold, silver & precious metals\n"
                "• Market predictions & trends\n\n"
                "*Try: \"What is RSI?\" or \"Suggest stocks for me\"*"
            ),
            'intent': 'qa'
        }

    return {
        'response': (
            "🧠 **Zeus AI**\n\n"
            "I'm still processing that. Here's what I can help with:\n"
            "• Live stock prices (e.g., *\"What is TCS price?\"*)\n"
            "• Market concepts (RSI, P/E, Moving Averages)\n"
            "• Stock recommendations\n"
            "• Portfolio management\n"
            "• Market predictions"
        ),
        'intent': 'qa'
    }
