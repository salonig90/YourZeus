import csv
import os
import random
from django.core.management.base import BaseCommand
from django.db import transaction
from users.models import Stock, PortfolioStock

class Command(BaseCommand):
    help = 'Reorganize stocks into new sectors based on nifty.csv'

    def handle(self, *args, **options):
        from django.conf import settings
        # nifty.csv is in the parent directory of backend (BASE_DIR)
        csv_path = os.path.join(settings.BASE_DIR, '..', 'nifty.csv')
        
        if not os.path.exists(csv_path):
            # Try absolute path as fallback (for different environments)
            csv_path = 'e:\\combined\\nifty.csv'
        
        if not os.path.exists(csv_path):
            self.stdout.write(self.style.ERROR(f'File not found: {csv_path}'))
            return

        # Mapping from Industry in CSV to the new sector IDs
        INDUSTRY_TO_SECTOR = {
            'Automobile and Auto Components': 'automobile and auto components',
            'Capital Goods': 'capital goods',
            'Chemicals': 'chemicals',
            'Construction': 'constructions',
            'Construction Materials': 'construction materials',
            'Consumer Durables': 'consumer durables',
            'Consumer Services': 'consumer services',
            'Fast Moving Consumer Goods': 'fast moving consumer goods',
            'Financial Services': 'financial services',
            'Healthcare': 'health care',
            'Information Technology': 'information technology',
            'Metals & Mining': 'metals & mining',
            'Oil Gas & Consumable Fuels': 'oil gas and consumable fuels',
            'Power': 'power',
            'Realty': 'realty',
            'Telecommunication': 'telecommunication',
            'Textiles': 'textiles',
        }

        self.stdout.write('Clearing existing stocks and portfolios...')
        with transaction.atomic():
            PortfolioStock.objects.all().delete()
            Stock.objects.all().delete()

        self.stdout.write('Populating stocks from nifty.csv...')
        
        stocks_to_create = []
        count = 0

        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                industry = row['Industry']
                sector = INDUSTRY_TO_SECTOR.get(industry)
                
                if not sector:
                    # Skip industries not in the user's requested list
                    continue
                
                symbol = f"{row['Symbol']}.NS"
                name = row['Company Name']
                
                # Mock some price data as we don't have it in CSV
                # In a real app, this would be updated by a background task using yfinance
                current_price = random.uniform(50, 5000)
                
                stock = Stock(
                    symbol=symbol,
                    name=name,
                    sector=sector,
                    current_price=current_price,
                    change=0,
                    change_percent=0,
                    day_high=current_price * 1.02,
                    day_low=current_price * 0.98,
                    pe_ratio=random.uniform(10, 50),
                    market_cap=random.randint(10**10, 10**12),
                    volume=random.randint(10**5, 10**7)
                )
                stocks_to_create.append(stock)
                count += 1

        with transaction.atomic():
            Stock.objects.bulk_create(stocks_to_create)

        self.stdout.write(self.style.SUCCESS(f'Successfully reorganized {count} stocks into new sectors.'))
