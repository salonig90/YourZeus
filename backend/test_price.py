from chatbot.tools import get_live_stock_price

import logging
logging.basicConfig(level=logging.INFO)

print("TCS.NS :", get_live_stock_price('TCS.NS'))
print("INFY.NS :", get_live_stock_price('INFY.NS'))
print("HCLTECH.NS :", get_live_stock_price('HCLTECH.NS'))
