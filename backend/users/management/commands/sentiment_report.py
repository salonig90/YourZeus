from django.core.management.base import BaseCommand
from users.models import Stock
from users.stock_sentiment import analyze_sector_sentiment
import json
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Generate sentiment analysis report for all sectors and stocks'

    def handle(self, *args, **options):
        sectors = list(Stock.objects.values_list('sector', flat=True).distinct())
        if not sectors:
            self.stdout.write(self.style.ERROR('No sectors found in database.'))
            return

        report = {}
        self.stdout.write(f"Analyzing {len(sectors)} sectors...")

        for sector in sectors:
            self.stdout.write(f"Analyzing sector: {sector} ({sectors.index(sector)+1}/{len(sectors)})...")
            try:
                sentiment = analyze_sector_sentiment(sector)
                if sentiment and 'stocks' in sentiment:
                    report[sector] = sentiment
                    self.stdout.write(self.style.SUCCESS(f"  Done: {len(sentiment['stocks'])} stocks analyzed."))
                else:
                    self.stdout.write(self.style.WARNING(f"  Warning: No data returned for {sector}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  Error analyzing {sector}: {str(e)}"))
                import traceback
                traceback.print_exc()

        # Save to a JSON file for the user to download/view
        report_path = os.path.join(settings.BASE_DIR, 'sentiment_report.json')
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=4)

        self.stdout.write(self.style.SUCCESS(f"Successfully generated sentiment report at {report_path}"))
        
        # Also print a summary table
        self.stdout.write("\n--- Sentiment Summary ---\n")
        self.stdout.write(f"{'Sector':<30} | {'Sentiment':<15} | {'Stocks'}")
        self.stdout.write("-" * 60)
        
        for sector, data in report.items():
            # Calculate sector average
            stocks_data = data.get('stocks', {})
            if not stocks_data:
                continue
                
            avg_score = sum(s['overall_score'] for s in stocks_data.values()) / len(stocks_data)
            sector_sentiment = "Bullish" if avg_score > 0.05 else "Bearish" if avg_score < -0.05 else "Neutral"
            
            self.stdout.write(f"{sector:<30} | {sector_sentiment:<15} | {len(stocks_data)} stocks")
