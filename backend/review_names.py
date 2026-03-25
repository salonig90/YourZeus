import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import Stock

print("Reviewing Stock Names in DB:")
for stock in Stock.objects.all()[:30]:
    print(f"[{stock.symbol}] -> '{stock.name}' (Sector: {stock.sector})")
