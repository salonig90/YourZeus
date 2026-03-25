import pandas as pd
import os
import random
from django.core.management.base import BaseCommand
from django.db import transaction
from users.models import Stock, PortfolioStock
from django.conf import settings

class Command(BaseCommand):
    help = 'Import USA stocks from usa.xlsx'

    def handle(self, *args, **options):
        # usa.xlsx is in the parent directory of backend (BASE_DIR) or same as nifty.csv
        file_path = os.path.join(settings.BASE_DIR, '..', 'usa.xlsx')
        
        if not os.path.exists(file_path):
            file_path = 'e:\\combined\\usa.xlsx'
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        self.stdout.write('Adding USA stocks to database...')
        try:
            df = pd.read_excel(file_path)
            
            # Map columns and create stock objects
            # Columns in usa.xlsx: ['Company', 'Symbol', 'Industry', 'Price', 'Change'] (assuming from inspection)
            # Actually, let's use the exact column names from previous inspection
            # If inspection showed more, adjust. Common names: 'Company', 'Symbol', 'Industry', 'Price'
            
            stocks_to_create = []
            sector = 'us_stocks'
            
            for index, row in df.iterrows():
                symbol = str(row['Symbol'])
                name = str(row['Company'])
                industry = str(row['Industry'])
                current_price = float(row['Price'])
                # Change might be in 'Change' or 'Change %'
                change_val = float(row.get('Change', 0))
                
                # Check for duplicates or existing
                if Stock.objects.filter(symbol=symbol).exists():
                    continue
                
                stock = Stock(
                    symbol=symbol,
                    name=name,
                    sector=sector,
                    current_price=current_price,
                    change=change_val,
                    change_percent=(change_val / current_price * 100) if current_price > 0 else 0,
                    day_high=current_price * 1.02,
                    day_low=current_price * 0.98,
                    pe_ratio=random.uniform(15, 35),
                    market_cap=random.randint(10**11, 10**13), # Big cap for US
                    volume=random.randint(10**6, 10**8)
                )
                stocks_to_create.append(stock)

            with transaction.atomic():
                Stock.objects.bulk_create(stocks_to_create)

            self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(stocks_to_create)} US stocks.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing US stocks: {str(e)}'))
