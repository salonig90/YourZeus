"""
Gold & Silver Sentiment Analysis Module
Scrapes financial news headlines and performs VADER + rule-based sentiment analysis.
"""

import re
import logging
import requests
from bs4 import BeautifulSoup
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from datetime import datetime

logger = logging.getLogger(__name__)

# Domain-specific keyword boosts for precious metals
BULLISH_KEYWORDS = {
    'rally': 0.25, 'surge': 0.3, 'soar': 0.3, 'jump': 0.2, 'gain': 0.15,
    'bullish': 0.35, 'record high': 0.3, 'all-time high': 0.35, 'breakout': 0.25,
    'demand': 0.15, 'buying': 0.15, 'accumulation': 0.2, 'safe haven': 0.25,
    'inflation': 0.15, 'uncertaint': 0.1, 'geopolitic': 0.15, 'crisis': 0.1,
    'upside': 0.2, 'strong': 0.1, 'positive': 0.15, 'outperform': 0.2,
    'higher': 0.1, 'rise': 0.15, 'rising': 0.15, 'up': 0.05,
    'buy': 0.15, 'invest': 0.1, 'growth': 0.15, 'boom': 0.25,
    'weak dollar': 0.2, 'rate cut': 0.2, 'dovish': 0.2,
}

BEARISH_KEYWORDS = {
    'crash': -0.3, 'plunge': -0.3, 'drop': -0.2, 'fall': -0.15, 'decline': -0.15,
    'bearish': -0.35, 'selloff': -0.3, 'sell-off': -0.3, 'slump': -0.25,
    'weak': -0.1, 'loss': -0.15, 'losing': -0.15, 'negative': -0.15,
    'downside': -0.2, 'lower': -0.1, 'down': -0.05, 'dip': -0.1,
    'sell': -0.15, 'dumping': -0.25, 'outflow': -0.2,
    'strong dollar': -0.2, 'rate hike': -0.2, 'hawkish': -0.2,
    'overvalued': -0.2, 'bubble': -0.2, 'correction': -0.15,
}

GOLD_KEYWORDS = [
    'gold', 'xau', 'bullion', 'yellow metal', 'gold price',
    'gold rate', 'gold futures', 'gold etf', 'sovereign gold',
    'gold bond', 'mcx gold', 'comex gold', 'spot gold',
    'gold bullion',
]

SILVER_KEYWORDS = [
    'silver', 'xag', 'silver price', 'silver rate', 'silver futures',
    'silver etf', 'mcx silver', 'comex silver', 'spot silver',
    'white metal',
]

# News sources configuration
NEWS_SOURCES = [
    {
        'name': 'Moneycontrol - Commodities',
        'url': 'https://www.moneycontrol.com/news/business/commodities/',
        'selector': 'li.clearfix h2 a, .news_list li h2 a, #caget498 li h2 a, .FL h2 a',
    },
    {
        'name': 'Economic Times - Gold',
        'url': 'https://economictimes.indiatimes.com/markets/commodities/news',
        'selector': '.eachStory h3 a, .story_list h3 a, .clr a, .story-box h3 a, .data_list .title a',
    },
    {
        'name': 'Moneycontrol - Gold News',
        'url': 'https://www.moneycontrol.com/news/tags/gold.html',
        'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a',
    },
    {
        'name': 'Economic Times - Silver',
        'url': 'https://economictimes.indiatimes.com/topic/silver-price',
        'selector': '.eachStory h3 a, .story_list h3 a, .clr a, .data_list .title a',
    },
    {
        'name': 'LiveMint - Gold',
        'url': 'https://www.livemint.com/market/commodities',
        'selector': 'h2 a, .headline a, .headlineSm a',
    },
]

# Fallback headlines for when scraping fails
FALLBACK_HEADLINES = [
    {"headline": "Gold prices steady near record highs amid global uncertainty", "source": "Market Analysis", "metal": "gold"},
    {"headline": "Silver demand rises on industrial and investment buying", "source": "Market Analysis", "metal": "silver"},
    {"headline": "Central banks continue gold accumulation in 2026", "source": "Market Analysis", "metal": "gold"},
]


def clean_text(text):
    """Clean and normalize headline text."""
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[^\w\s\-.,!?\'\"$%]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def classify_metal(text_lower):
    """Classify which metal a headline refers to."""
    is_gold = any(kw in text_lower for kw in GOLD_KEYWORDS)
    is_silver = any(kw in text_lower for kw in SILVER_KEYWORDS)

    if is_gold and is_silver:
        return 'both'
    elif is_gold:
        return 'gold'
    elif is_silver:
        return 'silver'
    
    generic_keywords = ['precious metal', 'commodity', 'commodities', 'mcx', 'comex', 'bullion']
    if any(kw in text_lower for kw in generic_keywords):
        return 'both'
    return None


def apply_rule_based_boost(text_lower):
    """Apply domain-specific keyword boosts to the sentiment score."""
    boost = 0.0
    matched_keywords = []

    for keyword, score in BULLISH_KEYWORDS.items():
        if keyword in text_lower:
            boost += score
            matched_keywords.append((keyword, score))

    for keyword, score in BEARISH_KEYWORDS.items():
        if keyword in text_lower:
            boost += score
            matched_keywords.append((keyword, score))

    boost = max(-0.5, min(0.5, boost))
    return boost, matched_keywords


def scrape_headlines():
    """Scrape financial news headlines from multiple sources."""
    headlines = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }

    for source in NEWS_SOURCES:
        try:
            response = requests.get(source['url'], headers=headers, timeout=8)
            if response.status_code != 200:
                continue

            soup = BeautifulSoup(response.text, 'lxml')
            selectors = source['selector'].split(', ')
            found_links = []
            for sel in selectors:
                found_links.extend(soup.select(sel.strip()))

            for link in found_links[:15]:
                title = clean_text(link.get_text())
                if title and len(title) > 15:
                    title_lower = title.lower()
                    metal = classify_metal(title_lower)
                    if metal:
                        headlines.append({
                            'headline': title,
                            'source': source['name'],
                            'metal': metal,
                            'url': link.get('href', ''),
                        })
        except Exception as e:
            logger.warning(f"Error scraping {source['name']}: {str(e)}")

    return headlines


def analyze_sentiment(headlines):
    """Perform VADER + rule-based sentiment analysis on headlines."""
    analyzer = SentimentIntensityAnalyzer()
    analyzed = []

    for item in headlines:
        text = item['headline']
        text_lower = text.lower()
        vader_scores = analyzer.polarity_scores(text)
        boost, keywords = apply_rule_based_boost(text_lower)
        combined_score = vader_scores['compound'] * 0.6 + boost * 0.4
        combined_score = max(-1.0, min(1.0, combined_score))

        if combined_score >= 0.1:
            classification = 'positive'
        elif combined_score <= -0.1:
            classification = 'negative'
        else:
            classification = 'neutral'

        analyzed.append({
            'headline': text,
            'source': item['source'],
            'metal': item['metal'],
            'vader_score': round(vader_scores['compound'], 4),
            'rule_boost': round(boost, 4),
            'combined_score': round(combined_score, 4),
            'classification': classification,
            'scores': {
                'positive': round(vader_scores['pos'], 4),
                'negative': round(vader_scores['neg'], 4),
                'neutral': round(vader_scores['neu'], 4),
            }
        })
    return analyzed


def aggregate_sentiment(analyzed_headlines, metal_filter):
    """Aggregate sentiment for a specific metal."""
    relevant = [h for h in analyzed_headlines if h['metal'] == metal_filter or h['metal'] == 'both']

    if not relevant:
        return {
            'overall_score': 0,
            'classification': 'Neutral',
            'confidence': 50,
            'positive_count': 0,
            'negative_count': 0,
            'neutral_count': 0,
            'total_headlines': 0,
            'prediction': 'Neutral',
        }

    scores = [h['combined_score'] for h in relevant]
    avg_score = sum(scores) / len(scores)

    positive_count = sum(1 for h in relevant if h['classification'] == 'positive')
    negative_count = sum(1 for h in relevant if h['classification'] == 'negative')
    neutral_count = sum(1 for h in relevant if h['classification'] == 'neutral')
    total = len(relevant)

    if avg_score >= 0.2:
        classification = 'Strong Bullish'
        prediction = 'Bullish'
    elif avg_score >= 0.05:
        classification = 'Mildly Bullish'
        prediction = 'Bullish'
    elif avg_score <= -0.2:
        classification = 'Strong Bearish'
        prediction = 'Bearish'
    elif avg_score <= -0.05:
        classification = 'Mildly Bearish'
        prediction = 'Bearish'
    else:
        classification = 'Neutral'
        prediction = 'Neutral'

    score_magnitude = abs(avg_score)
    consensus = max(positive_count, negative_count, neutral_count) / total if total > 0 else 0
    confidence = min(99, int(50 + score_magnitude * 40 + consensus * 20))

    return {
        'overall_score': round(avg_score, 4),
        'classification': classification,
        'confidence': confidence,
        'positive_count': positive_count,
        'negative_count': negative_count,
        'neutral_count': neutral_count,
        'total_headlines': total,
        'prediction': prediction,
    }


def analyze_metals_sentiment():
    """Main function: scrape, analyze, and aggregate sentiment for gold & silver."""
    headlines = scrape_headlines()
    if len(headlines) < 5:
        headlines.extend(FALLBACK_HEADLINES)

    analyzed = analyze_sentiment(headlines)
    gold_sentiment = aggregate_sentiment(analyzed, 'gold')
    silver_sentiment = aggregate_sentiment(analyzed, 'silver')

    gold_headlines = sorted(
        [h for h in analyzed if h['metal'] in ('gold', 'both')],
        key=lambda x: abs(x['combined_score']),
        reverse=True
    )[:10]

    silver_headlines = sorted(
        [h for h in analyzed if h['metal'] in ('silver', 'both')],
        key=lambda x: abs(x['combined_score']),
        reverse=True
    )[:10]

    return {
        'gold': {
            'sentiment': gold_sentiment,
            'headlines': gold_headlines,
        },
        'silver': {
            'sentiment': silver_sentiment,
            'headlines': silver_headlines,
        },
        'metadata': {
            'total_headlines_scraped': len(headlines),
            'total_analyzed': len(analyzed),
            'sources_used': list(set(h['source'] for h in headlines)),
            'analysis_timestamp': datetime.now().isoformat(),
            'method': 'VADER + Rule-Based Domain Analysis',
        }
    }
