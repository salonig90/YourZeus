from users.stock_sentiment import analyze_sector_sentiment
import logging

logging.basicConfig(level=logging.INFO)

try:
    print("Testing sentiment analysis for 'automobile'...")
    result = analyze_sector_sentiment('automobile')
    print("Success!")
    print(f"Stocks analyzed: {len(result['stocks'])}")
    print(f"Headlines found: {len(result['headlines'])}")
except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
