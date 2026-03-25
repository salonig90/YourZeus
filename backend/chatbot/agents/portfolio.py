"""
Portfolio Agent — handles add/remove stock requests.
Always requires MPIN verification before execution.
"""
import logging
from ..tools import extract_stock_symbol, get_live_stock_price

logger = logging.getLogger(__name__)


def run(query: str, user_id: int | None = None) -> dict:
    """
    Process a portfolio action request.
    Returns requires_mpin=True so the frontend shows the PIN pad.
    """
    if not user_id:
        return {
            'response': (
                "🔐 **Authentication Required**\n\n"
                "Portfolio management is only available to logged-in users.\n"
                "Please sign in to add or remove stocks from your portfolio."
            ),
            'intent': 'portfolio',
            'requires_auth': True,
        }

    q = query.lower()

    # Detect action type
    remove_keywords = ['remove', 'delete', 'sell', 'exclude', 'take out']
    action = 'remove' if any(k in q for k in remove_keywords) else 'add'

    # Extract stock symbol
    symbol = extract_stock_symbol(query)
    stock_name = symbol.replace('.NS', '') if symbol else None

    if not symbol:
        return {
            'response': (
                "🤔 **Which stock?**\n\n"
                "I couldn't identify the stock you want to manage. Please mention the stock name, e.g.:\n"
                "• *\"Add TCS to my portfolio\"*\n"
                "• *\"Remove Infosys from my holdings\"*"
            ),
            'intent': 'portfolio',
            'requires_mpin': False,
        }

    # Fetch current price for context
    price_data = get_live_stock_price(symbol)
    price_str = f"₹{price_data['price']:,.2f}" if '.NS' in symbol else f"${price_data['price']:,.2f}"
    change_str = f"{price_data['change_pct']:+.1f}%"

    action_word = 'add' if action == 'add' else 'remove'
    preposition = 'to' if action == 'add' else 'from'

    response = (
        f"{'➕' if action == 'add' else '➖'} **Portfolio Action: {action.title()} {stock_name}**\n\n"
        f"Current Price: **{price_str}** ({change_str} today)\n\n"
        f"To {action_word} **{stock_name}** {preposition} your portfolio, "
        f"please verify your MPIN below. 🔐"
    )

    return {
        'response': response,
        'intent': 'portfolio',
        'action': f'portfolio_{action}',
        'symbol': symbol,
        'stock_name': stock_name,
        'price': price_data['price'],
        'requires_mpin': True,
        'user_id': user_id,
    }
