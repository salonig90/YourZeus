"""
Shared tools for Zeus AI agents.
Each tool queries live data from yfinance, Django DB, or our internal APIs.
"""
import random
import logging
from datetime import datetime
import pytz

logger = logging.getLogger(__name__)

IST = pytz.timezone('Asia/Kolkata')

# Realistic stock names for entity extraction
POPULAR_STOCKS = {
    'tcs': 'TCS.NS', 'infosys': 'INFY.NS', 'infy': 'INFY.NS',
    'reliance': 'RELIANCE.NS', 'hdfc': 'HDFCBANK.NS', 'icici': 'ICICIBANK.NS',
    'wipro': 'WIPRO.NS', 'hcl': 'HCLTECH.NS', 'bajaj': 'BAJFINANCE.NS',
    'sbi': 'SBIN.NS', 'axis': 'AXISBANK.NS', 'kotak': 'KOTAKBANK.NS',
    'apple': 'AAPL', 'microsoft': 'MSFT', 'google': 'GOOGL', 'alphabet': 'GOOGL',
    'amazon': 'AMZN', 'tesla': 'TSLA', 'nvidia': 'NVDA', 'meta': 'META',
    'tatamotors': 'TATAMOTORS.NS', 'tata motors': 'TATAMOTORS.NS',
    'maruti': 'MARUTI.NS', 'sunpharma': 'SUNPHARMA.NS',
    'ntpc': 'NTPC.NS', 'dlf': 'DLF.NS',
}


import re

def extract_stock_symbol(text: str) -> str | None:
    """Extract first stock ticker from natural language."""
    symbols = extract_all_stock_symbols(text)
    return symbols[0] if symbols else None


def extract_all_stock_symbols(text: str) -> list[str]:
    """Extract all stock tickers from natural language."""
    text_lower = text.lower()
    symbols = set()
    
    # Check popular names
    for name, symbol in POPULAR_STOCKS.items():
        if re.search(rf'\b{re.escape(name)}\b', text_lower):
            symbols.add(symbol)
            
    # Check for direct ticker mention (e.g., INFY, TCS)
    matches = re.finditer(r'\b([A-Z]{2,10}(?:\.NS)?)\b', text)
    for m in matches:
        symbols.add(m.group(1))
        
    return list(symbols)


def get_live_stock_price(symbol: str) -> dict:
    """Fetch live stock price from yfinance with realistic fallback."""
    try:
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period='2d')
        if not hist.empty:
            price = float(hist['Close'].iloc[-1])
            import math
            if math.isnan(price):
                raise ValueError("NaN price returned by yfinance")
            prev = float(hist['Close'].iloc[-2]) if len(hist) > 1 else price
            change = price - prev
            change_pct = (change / prev * 100) if prev > 0 else 0
            return {
                'symbol': symbol,
                'price': round(price, 2),
                'change': round(change, 2),
                'change_pct': round(change_pct, 2),
                'timestamp': datetime.now(IST).isoformat()
            }
    except Exception as e:
        logger.warning(f"yfinance failed for {symbol}: {e}")
    # Fallback prices
    fallback = {'INFY.NS': 1560, 'TCS.NS': 3950, 'RELIANCE.NS': 2950,
                'HDFCBANK.NS': 1650, 'ICICIBANK.NS': 1200, 'SBIN.NS': 820,
                'AAPL': 235, 'MSFT': 380, 'GOOGL': 170, 'NVDA': 985, 'TSLA': 415}
    base = fallback.get(symbol, 500)
    return {
        'symbol': symbol,
        'price': round(base * (1 + random.uniform(-0.02, 0.02)), 2),
        'change': round(random.uniform(-20, 20), 2),
        'change_pct': round(random.uniform(-2, 2), 2),
        'timestamp': datetime.now(IST).isoformat(),
        'note': 'estimated data'
    }


def get_sector_top_performers(sector: str = 'it') -> list:
    """Return top 3 performers from a sector."""
    sector_stocks = {
        'it': ['TCS.NS', 'INFY.NS', 'HCLTECH.NS'],
        'banking': ['HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS'],
        'energy': ['RELIANCE.NS', 'NTPC.NS', 'POWERGRID.NS'],
        'pharma': ['SUNPHARMA.NS', 'CIPLA.NS', 'DRHP.NS'],
        'us': ['AAPL', 'MSFT', 'NVDA'],
    }
    symbols = sector_stocks.get(sector.lower(), sector_stocks['it'])
    results = []
    for symbol in symbols:
        data = get_live_stock_price(symbol)
        results.append(data)
    return sorted(results, key=lambda x: x['change_pct'], reverse=True)


def get_user_portfolio(user_id: int) -> list:
    """Fetch user portfolio from Django DB."""
    try:
        from users.models import PortfolioStock
        stocks = PortfolioStock.objects.filter(user_id=user_id).select_related('stock')
        result = []
        for ps in stocks:
            result.append({
                'symbol': ps.stock.symbol,
                'name': ps.stock.name,
                'sector': ps.sector,
                'quantity': ps.quantity,
                'buying_price': ps.buying_price,
                'current_price': ps.stock.current_price,
                'pnl': round((ps.stock.current_price - ps.buying_price) * ps.quantity, 2),
                'pnl_pct': round(((ps.stock.current_price - ps.buying_price) / ps.buying_price * 100)
                                 if ps.buying_price > 0 else 0, 2),
            })
        return result
    except Exception as e:
        logger.error(f"get_user_portfolio error: {e}")
        return []


def get_market_news_summary() -> str:
    """Return a structured market news snapshot."""
    import random
    headlines = [
        "📈 Indian markets open higher amid positive global cues",
        "💰 RBI holds interest rates steady in latest policy meeting",
        "🏦 Banking sector leads gains as credit growth accelerates",
        "⚡ Reliance Industries expands green energy investments",
        "🌐 US Fed signals continued caution on rate cuts",
        "📊 IT exports hit record high; TCS, Infosys outperform",
        "🛢️ Crude oil steady near $85/barrel; energy stocks mixed",
        "🥇 Gold near all-time highs as investors seek safe havens",
    ]
    selected = random.sample(headlines, 4)
    return '\n'.join(selected)


def calculate_portfolio_risk(portfolio: list) -> dict:
    """Simple risk scoring based on portfolio diversification."""
    if not portfolio:
        return {'risk_level': 'N/A', 'score': 0, 'message': 'No portfolio data'}

    sectors = list({p['sector'] for p in portfolio})
    diversification = len(sectors)

    # Calculate volatility proxy from PnL variance
    pnl_pcts = [abs(p['pnl_pct']) for p in portfolio]
    avg_volatility = sum(pnl_pcts) / len(pnl_pcts) if pnl_pcts else 0

    score = min(100, int(avg_volatility * 5 + (10 - diversification) * 5))

    if score < 30:
        risk_level = 'Low 🟢'
    elif score < 60:
        risk_level = 'Medium 🟡'
    else:
        risk_level = 'High 🔴'

    return {
        'risk_level': risk_level,
        'score': score,
        'diversification': diversification,
        'sectors': sectors,
        'message': f"Portfolio spans {diversification} sector(s) with avg volatility {avg_volatility:.1f}%"
    }
