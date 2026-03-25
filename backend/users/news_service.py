import requests
import xml.etree.ElementTree as ET
import logging
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
import random
import re

logger = logging.getLogger(__name__)

# Real RSS Feeds (Free)
NEWS_SOURCES = [
    {
        'name': 'Moneycontrol',
        'url': 'https://www.moneycontrol.com/rss/latestnews.xml',
        'category': 'Markets'
    },
    {
        'name': 'Economic Times',
        'url': 'https://economictimes.indiatimes.com/rssfeedsdefault.cms',
        'category': 'Business'
    },
    {
        'name': 'LiveMint',
        'url': 'https://www.livemint.com/rss/news',
        'category': 'Economy'
    },
    {
        'name': 'Business Standard',
        'url': 'https://www.business-standard.com/rss/latest-news-1.rss',
        'category': 'Corporate'
    },
    {
        'name': 'CNBC TV18',
        'url': 'https://www.cnbctv18.com/common/rss/market.xml',
        'category': 'Analysis'
    },
    {
        'name': 'Yahoo Finance',
        'url': 'https://finance.yahoo.com/news/rssindex',
        'category': 'Global'
    }
]

def clean_html(text):
    """Remove HTML tags from a string."""
    if not text: return ""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text).strip()

def fetch_rss_feed(source):
    """Fetch and parse a single RSS feed."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(source['url'], headers=headers, timeout=10)
        if response.status_code != 200:
            return []

        root = ET.fromstring(response.content)
        items = []
        
        # Typically RSS items are in channel/item
        for item in root.findall('.//item')[:10]:
            title = item.find('title')
            link = item.find('link')
            description = item.find('description')
            pub_date = item.find('pubDate')
            
            title_text = clean_html(title.text) if title is not None else ""
            if not title_text: continue
            
            items.append({
                'title': title_text,
                'content': clean_html(description.text)[:200] + '...' if description is not None else "No description available.",
                'url': link.text if link is not None else "#",
                'date': pub_date.text[:16] if pub_date is not None else datetime.now().strftime('%d %b %Y'),
                'category': source['category'],
                'source': source['name']
            })
        return items
    except Exception as e:
        logger.error(f"Error fetching RSS from {source['name']}: {str(e)}")
        return []

def get_real_news():
    """Aggregate news from all sources in parallel."""
    all_news = []
    
    with ThreadPoolExecutor(max_workers=len(NEWS_SOURCES)) as executor:
        results = executor.map(fetch_rss_feed, NEWS_SOURCES)
        for news_list in results:
            all_news.extend(news_list)
            
    # Sort by date if possible, or just shuffle for variety
    random.shuffle(all_news)
    
    # Limit to top 30 articles
    return all_news[:30]
