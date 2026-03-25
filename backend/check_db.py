import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import Stock

print(f"Total stocks in DB: {Stock.objects.count()}")
for stock in Stock.objects.all()[:10]:
    print(f" - {stock.symbol} ({stock.sector})")
