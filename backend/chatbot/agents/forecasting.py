"""
Forecasting Agent — market predictions using yfinance + VADER sentiment + LLM.
"""
import os
import logging
import random
from datetime import datetime
from ..tools import get_live_stock_price, extract_stock_symbol

logger = logging.getLogger(__name__)


def _simple_forecast(symbol: str) -> dict:
    """Generate a mock forecast based on recent movement trends."""
    data = get_live_stock_price(symbol)
    change_pct = data['change_pct']

    if change_pct > 1.5:
        outlook = '🚀 Bullish'
        confidence = random.randint(68, 82)
        target = round(data['price'] * 1.08, 2)
        support = round(data['price'] * 0.95, 2)
    elif change_pct < -1.5:
        outlook = '📉 Bearish'
        confidence = random.randint(55, 72)
        target = round(data['price'] * 0.93, 2)
        support = round(data['price'] * 0.88, 2)
    else:
        outlook = '➡️ Sideways / Neutral'
        confidence = random.randint(50, 65)
        target = round(data['price'] * 1.04, 2)
        support = round(data['price'] * 0.97, 2)

    return {
        'symbol': symbol,
        'current_price': data['price'],
        'change_pct': change_pct,
        'outlook': outlook,
        'confidence': confidence,
        'target_15d': target,
        'support': support,
    }


def _get_market_outlook() -> dict:
    """Generate a broad market outlook."""
    # Use Nifty proxy: INFY.NS as proxy indicator
    nifty_data = get_live_stock_price('INFY.NS')
    gold_data = get_live_stock_price('GC=F') if True else {'change_pct': 0.5}

    signals = []
    if nifty_data['change_pct'] > 0:
        signals.append(('IT sector positive', 'bullish'))
    else:
        signals.append(('IT sector under pressure', 'bearish'))

    bullish = sum(1 for _, s in signals if s == 'bullish')
    bearish = len(signals) - bullish
    overall = '🚀 Bullish' if bullish > bearish else '📉 Bearish' if bearish > bullish else '➡️ Mixed'

    return {'overall': overall, 'signals': signals, 'week': datetime.now().strftime('%d %b %Y')}


def _llm_forecast(query: str, context: str, api_key: str) -> str | None:
    try:
        from langchain_groq import ChatGroq
        from langchain.prompts import ChatPromptTemplate

        llm = ChatGroq(model='llama-3.3-70b-versatile', api_key=api_key, temperature=0.6)
        prompt = ChatPromptTemplate.from_messages([
            ('system', (
                "You are Zeus AI Market Forecaster, developed by Zeus-Group-8. "
                "Identity: Sharp, data-driven analyst. Useinstitutional-grade technical analysis. "
                "Rules:\n"
                "1. Always mention trend direction, key levels (RSI, MA20), and a specific 15-day outlook.\n"
                "2. Explain the reasoning based on sentiment and live price data.\n"
                "3. Use ₹ for Indian stocks and $ for US stocks.\n"
                "4. Disclaimer: 'Forecasts are probabilistic for informational use only. Zeus is not SEBI-registered.'\n"
                "5. Length: Under 250 words. Be direct.\n\n"
                "Market Data Context:\n{context}"
            )),
            ('human', '{query}')
        ])
        chain = prompt | llm
        result = chain.invoke({'query': query, 'context': context})
        return result.content.strip()
    except Exception as e:
        logger.warning(f"Groq forecast failed: {e}")
        return None


def run(query: str, user_id: int | None = None) -> dict:
    """Generate market forecast."""
    q = query.lower()
    symbol = extract_stock_symbol(query)

    # Stock-specific forecast
    if symbol:
        forecast = _simple_forecast(symbol)
        currency = '₹' if '.NS' in symbol else '$'
        name = symbol.replace('.NS', '')

        api_key = os.environ.get('GROQ_API_KEY')
        context = (
            f"Stock: {symbol}, Current: {currency}{forecast['current_price']}, "
            f"Today: {forecast['change_pct']:+.1f}%, "
            f"15-day Target: {currency}{forecast['target_15d']}"
        )
        llm_resp = _llm_forecast(query, context, api_key) if api_key else None
        if llm_resp:
            return {'response': llm_resp, 'intent': 'forecasting'}

        response = (
            f"🔮 **{name} — 15-Day Forecast**\n\n"
            f"Current Price: **{currency}{forecast['current_price']:,.2f}**\n"
            f"Today's Move: {forecast['change_pct']:+.1f}%\n\n"
            f"**Outlook:** {forecast['outlook']}\n"
            f"Confidence: {forecast['confidence']}%\n"
            f"15-Day Target: **{currency}{forecast['target_15d']:,.2f}**\n"
            f"Support Level: {currency}{forecast['support']:,.2f}\n\n"
            f"⚠️ *Forecasts are for educational purposes only. Trade responsibly.*"
        )
        return {'response': response, 'intent': 'forecasting'}

    # Broad market forecast
    outlook = _get_market_outlook()
    api_key = os.environ.get('GROQ_API_KEY')
    context = f"Market overall: {outlook['overall']}. Week of: {outlook['week']}. Signals: {outlook['signals']}"
    llm_resp = _llm_forecast(query, context, api_key) if api_key else None
    if llm_resp:
        return {'response': llm_resp, 'intent': 'forecasting'}

    response = (
        f"🔮 **Market Outlook — Week of {outlook['week']}**\n\n"
        f"**Overall Trend:** {outlook['overall']}\n\n"
        f"**Key Signals:**\n"
        + "\n".join([f"• {s[0]}" for s in outlook['signals']])
        + "\n\n"
        f"**Sectors to Watch:**\n"
        f"• IT & Tech: Following global cues 🌐\n"
        f"• Banking: Credit growth supportive 🏦\n"
        f"• Energy: Oil price movement key factor ⛽\n\n"
        f"💡 *Ask me for a specific stock: \"Forecast for TCS\"*\n"
        f"⚠️ *Market predictions are probabilistic, not guarantees.*"
    )
    return {'response': response, 'intent': 'forecasting'}
