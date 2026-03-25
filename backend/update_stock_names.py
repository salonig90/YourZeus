import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import Stock
from stock_names import STOCK_NAME_MAPPING

print("Updating Stock Names to full company names...")
updated_count = 0
for symbol, full_name in STOCK_NAME_MAPPING.items():
    stocks = Stock.objects.filter(symbol=symbol)
    if stocks.exists():
        for s in stocks:
            if s.name != full_name:
                old_name = s.name
                s.name = full_name
                s.save(update_fields=['name'])
                print(f"Updated: {symbol}: '{old_name}' -> '{full_name}'")
                updated_count += 1

print(f"Update complete. {updated_count} stocks updated.")
