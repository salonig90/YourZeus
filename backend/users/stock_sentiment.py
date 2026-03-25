"""
Stock Sentiment Analysis Module
Scrapes financial news headlines for sector stocks and performs
VADER + rule-based sentiment analysis per stock.
"""

import re
import logging
import requests
import os
import django
from bs4 import BeautifulSoup
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from datetime import datetime

# Setup Django environment if needed
if not os.environ.get('DJANGO_SETTINGS_MODULE'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()

from users.models import Stock

logger = logging.getLogger(__name__)

# ─── Domain-specific keyword boosts ───

BULLISH_KEYWORDS = {
    'rally': 0.25, 'surge': 0.3, 'soar': 0.3, 'jump': 0.2, 'gain': 0.15,
    'bullish': 0.35, 'record high': 0.3, 'all-time high': 0.35, 'breakout': 0.25,
    'demand': 0.15, 'buying': 0.15, 'accumulation': 0.2, 'outperform': 0.2,
    'upside': 0.2, 'strong': 0.1, 'positive': 0.15, 'upgrade': 0.25,
    'higher': 0.1, 'rise': 0.15, 'rising': 0.15, 'buy': 0.15,
    'growth': 0.15, 'boom': 0.25, 'beat': 0.2, 'beats': 0.2,
    'profit': 0.15, 'revenue': 0.1, 'earnings': 0.1, 'dividend': 0.15,
    'expansion': 0.15, 'innovation': 0.1, 'launch': 0.1, 'partnership': 0.1,
    'acquisition': 0.1, 'overweight': 0.2, 'target raised': 0.25,
}

BEARISH_KEYWORDS = {
    'crash': -0.3, 'plunge': -0.3, 'drop': -0.2, 'fall': -0.15, 'decline': -0.15,
    'bearish': -0.35, 'selloff': -0.3, 'sell-off': -0.3, 'slump': -0.25,
    'weak': -0.1, 'loss': -0.15, 'losing': -0.15, 'negative': -0.15,
    'downside': -0.2, 'lower': -0.1, 'down': -0.05, 'dip': -0.1,
    'sell': -0.15, 'dumping': -0.25, 'outflow': -0.2, 'downgrade': -0.25,
    'overvalued': -0.2, 'bubble': -0.2, 'correction': -0.15,
    'miss': -0.2, 'misses': -0.2, 'underperform': -0.2,
    'fraud': -0.35, 'scandal': -0.3, 'lawsuit': -0.2, 'penalty': -0.2,
    'debt': -0.1, 'default': -0.25, 'underweight': -0.2, 'target cut': -0.25,
}

# ─── Sector-specific news sources ───

SECTOR_NEWS_SOURCES = {
    'information technology': [
        {'name': 'Moneycontrol IT', 'url': 'https://www.moneycontrol.com/news/business/it/', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
        {'name': 'ET IT', 'url': 'https://economictimes.indiatimes.com/tech/technology', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
    'financial services': [
        {'name': 'Moneycontrol Banking', 'url': 'https://www.moneycontrol.com/news/business/banks/', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
        {'name': 'ET Banking', 'url': 'https://economictimes.indiatimes.com/industry/banking/finance', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
    'automobile and auto components': [
        {'name': 'Moneycontrol Auto', 'url': 'https://www.moneycontrol.com/news/business/automobile/', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
        {'name': 'ET Auto', 'url': 'https://economictimes.indiatimes.com/industry/auto', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
    'health care': [
        {'name': 'Moneycontrol Pharma', 'url': 'https://www.moneycontrol.com/news/business/pharma/', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
        {'name': 'ET Pharma', 'url': 'https://economictimes.indiatimes.com/industry/healthcare/biotech/pharmaceuticals', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
    'power': [
        {'name': 'Moneycontrol Energy', 'url': 'https://www.moneycontrol.com/news/business/energy/', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
        {'name': 'ET Energy', 'url': 'https://economictimes.indiatimes.com/industry/energy', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
    'metals & mining': [
        {'name': 'Moneycontrol Metals', 'url': 'https://www.moneycontrol.com/news/business/metals/', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
        {'name': 'ET Metals', 'url': 'https://economictimes.indiatimes.com/industry/indl-goods/svs/metals-mining', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
    'fast moving consumer goods': [
        {'name': 'Moneycontrol FMCG', 'url': 'https://www.moneycontrol.com/news/business/consumer/', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
        {'name': 'ET FMCG', 'url': 'https://economictimes.indiatimes.com/industry/cons-products/fmcg', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
    'consumer services': [
        {'name': 'Moneycontrol Hospitality', 'url': 'https://www.moneycontrol.com/news/business/hospitality/', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
        {'name': 'ET Hospitality', 'url': 'https://economictimes.indiatimes.com/industry/services/hotels-/-restaurants', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
    'realty': [
        {'name': 'Moneycontrol Realty', 'url': 'https://www.moneycontrol.com/news/business/real-estate/', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
        {'name': 'ET Real Estate', 'url': 'https://economictimes.indiatimes.com/industry/services/property-/-cstruction', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
    'capital goods': [
        {'name': 'Moneycontrol Capital Goods', 'url': 'https://www.moneycontrol.com/news/tags/capital-goods.html', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
        {'name': 'ET Capital Goods', 'url': 'https://economictimes.indiatimes.com/industry/indl-goods/svs', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
    'chemicals': [
        {'name': 'Moneycontrol Chemicals', 'url': 'https://www.moneycontrol.com/news/tags/chemicals.html', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
        {'name': 'ET Chemicals', 'url': 'https://economictimes.indiatimes.com/industry/indl-goods/chemicals', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
    'telecommunication': [
        {'name': 'ET telecom', 'url': 'https://telecom.economictimes.indiatimes.com/', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
    'oil gas and consumable fuels': [
        {'name': 'Moneycontrol Oil & Gas', 'url': 'https://www.moneycontrol.com/news/tags/oil-and-gas.html', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
    ],
    'us_stocks': [
        {'name': 'Moneycontrol US Markets', 'url': 'https://www.moneycontrol.com/news/business/markets/', 'selector': 'li.clearfix h2 a, .news_list li h2 a, .FL h2 a'},
        {'name': 'ET US Markets', 'url': 'https://economictimes.indiatimes.com/markets/stocks/news', 'selector': '.eachStory h3 a, .story_list h3 a, .data_list .title a'},
    ],
}

# ─── Stock name mapping for matching headlines to stocks ───

STOCK_NAME_MAP = {
    # Automobile
    'BAJAJ-AUTO.NS': ['bajaj auto', 'bajaj'],
    'BHARATFORG.NS': ['bharat forge'],
    'BOSCHLTD.NS': ['bosch'],
    'EICHERMOT.NS': ['eicher motors', 'eicher'],
    'EXIDEIND.NS': ['exide industries', 'exide'],
    'HEROMOTOCO.NS': ['hero motocorp', 'hero'],
    'HYUNDAI.NS': ['hyundai motor', 'hyundai'],
    'MRF.NS': ['mrf'],
    'M&M.NS': ['mahindra & mahindra', 'mahindra', 'm&m'],
    'MARUTI.NS': ['maruti suzuki', 'maruti'],
    'MOTHERSON.NS': ['samvardhana motherson', 'motherson'],
    'SONACOMS.NS': ['sona blw', 'sona coms'],
    'TVSMOTOR.NS': ['tvs motor', 'tvs'],
    'TATAMOTORS.NS': ['tata motors', 'tatamotors'],
    'TIINDIA.NS': ['tube investments', 'ti india'],
    # Banking
    'SBIN.NS': ['state bank of india', 'sbi'],
    'HDFCBANK.NS': ['hdfc bank', 'hdfc'],
    'ICICIBANK.NS': ['icici bank', 'icici'],
    'AXISBANK.NS': ['axis bank', 'axis'],
    'KOTAKBANK.NS': ['kotak mahindra bank', 'kotak'],
    'INDUSINDBK.NS': ['indusind bank', 'indusind'],
    'YESBANK.NS': ['yes bank'],
    'BANKBARODA.NS': ['bank of baroda', 'bob'],
    'PNB.NS': ['punjab national bank', 'pnb'],
    'CANBK.NS': ['canara bank'],
    'UNIONBANK.NS': ['union bank'],
    'IDFCFIRSTB.NS': ['idfc first bank', 'idfc'],
    'FEDERALBNK.NS': ['federal bank'],
    'BANKINDIA.NS': ['bank of india'],
    'INDIANB.NS': ['indian bank'],
    # Finance
    'BAJFINANCE.NS': ['bajaj finance'],
    'BAJAJFINSV.NS': ['bajaj finserv'],
    'JIOFIN.NS': ['jio financial', 'jiofin'],
    'MUTHOOTFIN.NS': ['muthoot finance', 'muthoot'],
    'SHRIRAMFIN.NS': ['shriram finance', 'shriram'],
    'LICHSGFIN.NS': ['lic housing finance', 'lichsg'],
    'PFC.NS': ['power finance corporation', 'pfc'],
    'RECLTD.NS': ['rec ltd', 'rec'],
    'MOTILALOFS.NS': ['motilal oswal'],
    'CHOLAFIN.NS': ['cholamandalam'],
    'HDFCAMC.NS': ['hdfc amc'],
    'HDFCLIFE.NS': ['hdfc life'],
    'SBILIFE.NS': ['sbi life'],
    'ICICIGI.NS': ['icici lombard'],
    'PAYTM.NS': ['paytm'],
    'POLICYBZR.NS': ['policybazaar', 'pb fintech'],
    'IRFC.NS': ['irfc'],
    'IREDA.NS': ['ireda'],
    'HUDCO.NS': ['hudco'],
    'L&TFH.NS': ['l&t finance'],
    'M&MFIN.NS': ['mahindra finance'],
    'BAJAJHFL.NS': ['bajaj housing finance'],
    'MAXFSL.NS': ['max financial'],
    'SBICARD.NS': ['sbi cards'],
    'BSE.NS': ['bse ltd'],
    '360ONE.NS': ['360 one wam'],
    # Energy
    'RELIANCE.NS': ['reliance industries', 'reliance', 'ril'],
    'NTPC.NS': ['ntpc'],
    'POWERGRID.NS': ['power grid'],
    'TATAPOWER.NS': ['tata power'],
    'ADANIPOWER.NS': ['adani power'],
    'ADANIGREEN.NS': ['adani green'],
    'ADANIENSOL.NS': ['adani energy solutions', 'adani energy'],
    'ONGC.NS': ['ongc'],
    'IOC.NS': ['indian oil corporation', 'ioc'],
    'BPCL.NS': ['bharat petroleum', 'bpcl'],
    'HPCL.NS': ['hindustan petroleum', 'hpcl'],
    'GAIL.NS': ['gail'],
    'COALINDIA.NS': ['coal india'],
    'OIL.NS': ['oil india'],
    'IGL.NS': ['indraprastha gas', 'igl'],
    'ATGL.NS': ['adani total gas'],
    'NTPCGREEN.NS': ['ntpc green'],
    'TORNTPOWER.NS': ['torrent power'],
    'JSWENERGY.NS': ['jsw energy'],
    # Pharma
    'SUNPHARMA.NS': ['sun pharma'],
    'DRREDDY.NS': ['dr reddy'],
    'CIPLA.NS': ['cipla'],
    'DIVISLAB.NS': ["divi's labs", 'divis'],
    'LUPIN.NS': ['lupin'],
    'AUROPHARMA.NS': ['aurobindo pharma', 'aurobindo'],
    'BIOCON.NS': ['biocon'],
    'ZYDUSLIFE.NS': ['zydus lifesciences', 'zydus'],
    'APOLLOHOSP.NS': ['apollo hospitals', 'apollo'],
    'FORTIS.NS': ['fortis healthcare', 'fortis'],
    'MAXHEALTH.NS': ['max healthcare', 'max health'],
    'GLENMARK.NS': ['glenmark'],
    'ALKEM.NS': ['alkem labs', 'alkem'],
    'MANKIND.NS': ['mankind pharma', 'mankind'],
    'TORNTPHARM.NS': ['torrent pharma'],
    # FMCG
    'HINDUNILVR.NS': ['hindustan unilever', 'hul'],
    'ITC.NS': ['itc ltd', 'itc'],
    'NESTLEIND.NS': ['nestle india', 'nestle'],
    'BRITANNIA.NS': ['britannia'],
    'DABUR.NS': ['dabur'],
    'MARICO.NS': ['marico'],
    'COLPAL.NS': ['colgate palmolive', 'colgate'],
    'GODREJCP.NS': ['godrej consumer'],
    'TATACONSUM.NS': ['tata consumer'],
    'VBL.NS': ['varun beverages', 'vbl'],
    'PATANJALI.NS': ['patanjali foods', 'patanjali'],
    'UNITDSPR.NS': ['united spirits'],
    # Metals
    'TATASTEEL.NS': ['tata steel'],
    'JSWSTEEL.NS': ['jsw steel'],
    'HINDALCO.NS': ['hindalco'],
    'VEDL.NS': ['vedanta'],
    'SAIL.NS': ['sail'],
    'NMDC.NS': ['nmdc'],
    'NATIONALUM.NS': ['national aluminium', 'nalco'],
    'HINDZINC.NS': ['hindustan zinc'],
    'JINDALSTEL.NS': ['jindal steel'],
    # Realty
    'DLF.NS': ['dlf'],
    'GODREJPROP.NS': ['godrej properties'],
    'OBEROIREAL.NS': ['oberoi realty'],
    'PRESTIGE.NS': ['prestige estates', 'prestige'],
    'PHOENIXLTD.NS': ['phoenix mills'],
    'LODHA.NS': ['lodha developers', 'lodha'],
    # IT
    'TCS.NS': ['tcs', 'tata consultancy'],
    'INFY.NS': ['infosys', 'infy'],
    'WIPRO.NS': ['wipro'],
    'HCLTECH.NS': ['hcl tech', 'hcl technologies'],
    'TECHM.NS': ['tech mahindra', 'techm'],
    'LTIM.NS': ['ltimindtree', 'ltim'],
    'PERSISTENT.NS': ['persistent systems', 'persistent'],
    'MPHASIS.NS': ['mphasis'],
    'COFORGE.NS': ['coforge'],
    'OFSS.NS': ['oracle financial services', 'ofss'],
    'KPITTECH.NS': ['kpit tech', 'kpit'],
    'TATAELXSI.NS': ['tata elxsi'],
    'TATATECH.NS': ['tata technologies'],
    # Capital Goods
    'ABB.NS': ['abb india', 'abb'],
    'SIEMENS.NS': ['siemens'],
    'LT.NS': ['larsen & toubro', 'l&t'],
    'CUMMINSIND.NS': ['cummins india', 'cummins'],
    'HAVELLS.NS': ['havells'],
    'POLYCAB.NS': ['polycab'],
    'CGPOWER.NS': ['cg power'],
    'BEL.NS': ['bharat electronics', 'bel'],
    'BHEL.NS': ['bhel'],
    'HAL.NS': ['hal'],
    'MAZDOCK.NS': ['mazagon dock'],
    'KEI.NS': ['kei industries', 'kei'],
    'APLAPOLLO.NS': ['apl apollo tubes', 'apl apollo'],
    'ASTRAL.NS': ['astral ltd', 'astral'],
    'PREMIERENE.NS': ['premier energies'],
    'WAREEENER.NS': ['waaree energies'],
    'ENRIN.NS': ['siemens energy india'],
    # Telecom
    'BHARTIARTL.NS': ['bharti airtel', 'airtel'],
    'IDEA.NS': ['vodafone idea', 'vi', 'idea'],
    'INDUSTOWER.NS': ['indus towers'],
    'TATACOMM.NS': ['tata communications'],
    'BHARTIHEXA.NS': ['bharti hexacom'],
    # Chemicals
    'UPL.NS': ['upl'],
    'SRF.NS': ['srf'],
    'PIIND.NS': ['pi industries', 'pi ind'],
    'PIDILITIND.NS': ['pidilite'],
    'COROMANDEL.NS': ['coromandel international', 'coromandel'],
    'SOLARINDS.NS': ['solar industries'],
    # Consumer Durables
    'TITAN.NS': ['titan'],
    'VOLTAS.NS': ['voltas'],
    'DIXON.NS': ['dixon'],
    'BLUESTARCO.NS': ['blue star'],
    'KALYANKJIL.NS': ['kalyan jewellers'],
    # Construction
    'ULTRACEMCO.NS': ['ultratech cement', 'ultratech'],
    'GRASIM.NS': ['grasim'],
    'AMBUJACEM.NS': ['ambuja cement', 'ambuja'],
    'ACC.NS': ['acc'],
    'IRB.NS': ['irb infra', 'irb'],
    'RVNL.NS': ['rvnl'],
    # Hospitality
    'INDHOTEL.NS': ['indian hotels', 'taj hotels'],
    'ITCHOTELS.NS': ['itc hotels'],
    'IRCTC.NS': ['irctc'],
    'JUBLFOOD.NS': ['jubilant foodworks', 'dominos'],
    'DMART.NS': ['dmart', 'avenue supermarts'],
    'TRENT.NS': ['trent'],
    'SWIGGY.NS': ['swiggy'],
    'NYKAA.NS': ['nykaa'],
    'ZOMATO.NS': ['zomato'],
    # US Stocks
    'AAPL': ['apple', 'aapl', 'iphone'],
    'MSFT': ['microsoft', 'msft', 'windows', 'azure'],
    'GOOGL': ['google', 'alphabet', 'googl'],
    'GOOG': ['google', 'alphabet', 'goog'],
    'AMZN': ['amazon', 'amzn', 'aws'],
    'META': ['meta', 'facebook', 'instagram', 'whatsapp'],
    'NVDA': ['nvidia', 'nvda'],
    'BRK-B': ['berkshire', 'brk', 'buffett'],
    'BRK.B': ['berkshire', 'brk', 'buffett'],
    'V': ['visa'],
    'MA': ['mastercard'],
    'HD': ['home depot'],
    'DIS': ['disney', 'dis'],
    'ADBE': ['adobe', 'adbe'],
    'NFLX': ['netflix', 'nflx'],
    'CRM': ['salesforce', 'crm'],
    'AMD': ['amd', 'advanced micro'],
    'INTC': ['intel', 'intc'],
    'JPM': ['jpmorgan', 'jp morgan', 'jpm', 'chase'],
    'BAC': ['bank of america', 'bofa', 'bac'],
    'WFC': ['wells fargo', 'wfc'],
    'GS': ['goldman sachs', 'goldman', 'gs'],
    'TSLA': ['tesla', 'tsla'],
    'TM': ['toyota', 'toyota motor'],
    'GM': ['general motors', 'gm'],
    'F': ['ford', 'ford motor'],
    'XOM': ['exxon', 'exxonmobil', 'xom'],
    'CVX': ['chevron', 'cvx'],
    'COP': ['conocophillips', 'conoco', 'cop'],
    'MPC': ['marathon petroleum', 'marathon', 'mpc'],
    'JNJ': ['johnson & johnson', 'j&j', 'jnj'],
    'UNH': ['unitedhealth', 'unh', 'united health'],
    'PFE': ['pfizer', 'pfe'],
    'ABBV': ['abbvie', 'abbv'],
    'PG': ['procter', 'p&g', 'procter & gamble'],
    'KO': ['coca-cola', 'coca cola', 'coke', 'ko'],
    'NSRGY': ['nestle global', 'nsrgy'],
    'DEO': ['diageo', 'deo'],
    'VALE': ['vale'],
    'RIO': ['rio tinto', 'rio'],
    'SCCO': ['southern copper', 'scco'],
    'FCX': ['freeport', 'freeport-mcmoran', 'fcx'],
    'BX': ['blackstone', 'bx'],
    'KKR': ['kkr'],
    'BLK': ['blackrock', 'blk'],
    'AMP': ['ameriprise', 'amp'],
    'RCL': ['royal caribbean', 'rcl'],
    'CCL': ['carnival', 'ccl'],
    'MAR': ['marriott', 'mar'],
    'HLT': ['hilton', 'hlt'],
    'SPG': ['simon property', 'spg'],
    'PLD': ['prologis', 'pld'],
    'VNO': ['vornado', 'vno'],
    'AMB': ['amb', 'ambac'],
    'AVGO': ['broadcom', 'avgo'],
    'BRCM': ['broadcom', 'brcm'],
    'WMT': ['walmart', 'wmt'],
    'LLY': ['eli lilly', 'lly'],
    'MU': ['micron', 'mu'],
    'COST': ['costco'],
    'ORCL': ['oracle', 'orcl'],
    'PLTR': ['palantir', 'pltr'],
    'CAT': ['caterpillar', 'cat'],
    'CSCO': ['cisco'],
    'GE': ['ge aerospace', 'ge'],
    'LRCX': ['lam research', 'lrcx'],
    'AMAT': ['applied materials', 'amat'],
    'MRK': ['merck', 'mrk'],
    'RTX': ['rtx'],
    'MS': ['morgan stanley', 'ms'],
    'PM': ['philip morris', 'pm'],
    'TMUS': ['t-mobile', 'tmus'],
    'GEV': ['ge vernova', 'gev'],
    'IBM': ['ibm'],
    'LIN': ['linde'],
    'MCD': ['mcdonalds', 'mcd'],
    'VZ': ['verizon', 'vz'],
    'PEP': ['pepsico', 'pep'],
    'AXP': ['american express', 'axp'],
    'T': ['at&t', 't'],
    'KLAC': ['kla corp', 'klac'],
    'C': ['citigroup', 'citi', 'c'],
    'AMGN': ['amgen'],
    'NEE': ['nextera energy', 'nee'],
    'ABT': ['abbott labs', 'abt'],
    'TMO': ['thermo fisher', 'tmo'],
    'TJX': ['tjx'],
    'TXN': ['texas instruments', 'txn'],
    'GILD': ['gilead', 'gild'],
    'ISRG': ['intuitive surgical', 'isrg'],
    'SCHW': ['charles schwab', 'schwab', 'schw'],
    'ANET': ['arista networks', 'anet'],
    'APH': ['amphenol', 'aph'],
    'BA': ['boeing', 'ba'],
    'UBER': ['uber'],
    'DE': ['deere', 'de'],
    'ADI': ['analog devices', 'adi'],
    'APP': ['applovin', 'app'],
    'LMT': ['lockheed martin', 'lmt'],
    'HON': ['honeywell', 'hon'],
    'UNP': ['union pacific', 'unp'],
    'QCOM': ['qualcomm', 'qcom'],
    'ETN': ['eaton'],
    'BKNG': ['booking holdings', 'bkng'],
    'WELL': ['welltower', 'well'],
    'DHR': ['danaher', 'dhr'],
    'PANW': ['palo alto networks', 'panw'],
    'SYK': ['stryker', 'syk'],
    'SPGI': ['s&p global', 'spgi'],
    'LOW': ['lowes', 'low'],
    'INTU': ['intuit', 'intu'],
    'CB': ['chubb', 'cb'],
    'ACN': ['accenture', 'acn'],
    'PGR': ['progressive', 'pgr'],
    'BMY': ['bristol myers squibb', 'bmy'],
    'NOW': ['servicenow', 'now'],
    'VRTX': ['vertex pharma', 'vrtx'],
    'PH': ['parker hannifin', 'ph'],
    'COF': ['capital one', 'cof'],
    'MDT': ['medtronic', 'mdt'],
    'HCA': ['hca healthcare', 'hca'],
    'CME': ['cme group', 'cme'],
    'MCK': ['mckesson', 'mck'],
    'MO': ['altria', 'mo'],
    'GLW': ['corning', 'glw'],
    'SBUX': ['starbucks', 'sbux'],
    'SNDK': ['sandisk', 'sndk'],
    'SO': ['southern company', 'so'],
    'CMCSA': ['comcast', 'cmcsa'],
    'NEM': ['newmont', 'nem'],
    'CRWD': ['crowdstrike', 'crwd'],
    'BSX': ['boston scientific', 'bsx'],
    'CEG': ['constellation energy', 'ceg'],
    'DELL': ['dell'],
    'NOC': ['northrop grumman', 'noc'],
    'WDC': ['western digital', 'wdc'],
    'DUK': ['duke energy', 'duk'],
    'EQIX': ['equinix', 'eqix'],
    'GD': ['general dynamics', 'gd'],
    'WM': ['waste management', 'wm'],
    'HWM': ['howmet aerospace', 'hwm'],
    'STX': ['seagate', 'stx'],
    'CVS': ['cvs'],
    'TT': ['trane technologies', 'tt'],
    'ICE': ['intercontinental exchange', 'ice'],
    'WMB': ['williams companies', 'wmb'],
    'MMC': ['marsh & mclennan', 'mmc'],
    'MRSH': ['marsh & mclennan', 'mrsh'],
    'FDX': ['fedex', 'fdx'],
    'ADP': ['adp'],
    'PWR': ['quanta services', 'pwr'],
    'AMT': ['american tower', 'amt'],
    'UPS': ['ups'],
    'PNC': ['pnc'],
    'SNPS': ['synopsys', 'snps'],
    'USB': ['us bancorp', 'usb'],
    'JCI': ['johnson controls', 'jci'],
    'BK': ['bny mellon', 'bk'],
    'CDNS': ['cadence design', 'cdns'],
    'NKE': ['nike'],
    'REGN': ['regeneron', 'regn'],
    'MCO': ['moodys', 'mco'],
    'ABNB': ['airbnb', 'abnb'],
    'SHW': ['sherwin-williams', 'shw'],
    'MSI': ['motorola solutions', 'msi'],
    'EOG': ['eog resources', 'eog'],
    'MMM': ['3m'],
    'ITW': ['illinois tool works', 'itw'],
    'CMI': ['cummins'],
    'ORLY': ['oreilly auto', 'orly'],
    'KMI': ['kinder morgan', 'kmi'],
    'ECL': ['ecolab', 'ecl'],
    'MNST': ['monster beverage', 'mnst'],
    'MDLZ': ['mondelez', 'mdlz'],
    'EMR': ['emerson', 'emr'],
    'CTAS': ['cintas', 'ctas'],
    'VLO': ['valero', 'vlo'],
    'CSX': ['csx'],
    'PSX': ['phillips 66', 'psx'],
    'SLB': ['schlumberger', 'slb'],
    'AON': ['aon'],
    'CI': ['cigna', 'ci'],
    'ROST': ['ross stores', 'rost'],
    'CL': ['colgate-palmolive', 'cl'],
    'DASH': ['doordash', 'dash'],
    'WBD': ['warner bros', 'wbd'],
    'AEP': ['american electric power', 'aep'],
    'RSG': ['republic services', 'rsg'],
    'CRH': ['crh'],
    'TDG': ['transdigm', 'tdg'],
    'LHX': ['l3harris', 'lhx'],
    'APO': ['apollo global', 'apo'],
    'ELV': ['elevance health', 'elv'],
    'TRV': ['travelers', 'trv'],
    'HOOD': ['robinhood', 'hood'],
    'COR': ['cencora', 'cor'],
    'NSC': ['norfolk southern', 'nsc'],
    'APD': ['air products', 'apd'],
    'FTNT': ['fortinet', 'ftnt'],
    'SRE': ['sempra', 'sre'],
    'OXY': ['occidental', 'oxy'],
    'BKR': ['baker hughes', 'bkr'],
    'DLR': ['digital realty', 'dlr'],
    'PCAR': ['paccar', 'pcar'],
    'TEL': ['te connectivity', 'tel'],
    'O': ['realty income', 'o'],
    'OKE': ['oneok', 'oke'],
    'AJG': ['arthur j gallagher', 'ajg'],
    'AFL': ['aflac'],
    'TFC': ['truist', 'tfc'],
    'CIEN': ['ciena'],
    'AZO': ['autozone', 'azo'],
    'FANG': ['diamondback energy', 'fang'],
    'ALL': ['allstate', 'all']
}

# ─── Sector stock symbols (moved to views.py/database) ───

def get_sector_symbols(sector):
    """Retrieve stock symbols for a given sector from the database."""
    return list(Stock.objects.filter(sector=sector).values_list('symbol', flat=True))

# ─── Fallback headlines per sector ───

SECTOR_FALLBACK_HEADLINES = {
    'it': [
        {"headline": "Infosys wins major digital transformation deal with global client", "source": "Market Analysis", "stock": "INFY.NS"},
        {"headline": "TCS revenue beats estimates driven by cloud services demand", "source": "Market Analysis", "stock": "TCS.NS"},
        {"headline": "HCL Technologies expands engineering services portfolio", "source": "Market Analysis", "stock": "HCLTECH.NS"},
        {"headline": "Wipro announces strategic AI partnership with hyperscaler", "source": "Market Analysis", "stock": "WIPRO.NS"},
        {"headline": "Tech Mahindra restructures operations for margin improvement", "source": "Market Analysis", "stock": "TECHM.NS"},
        {"headline": "Microsoft Azure AI services revenue surges quarter-over-quarter", "source": "Market Analysis", "stock": "MSFT"},
        {"headline": "Google Cloud platform gains enterprise market share", "source": "Market Analysis", "stock": "GOOG"},
        {"headline": "Apple services revenue reaches new all-time high", "source": "Market Analysis", "stock": "AAPL"},
        {"headline": "IT sector outlook remains strong amid digital spending growth", "source": "Market Analysis", "stock": "sector"},
    ],
    'banking': [
        {"headline": "HDFC Bank reports strong quarterly earnings beating estimates", "source": "Market Analysis", "stock": "HDFCBANK.NS"},
        {"headline": "ICICI Bank sees robust growth in retail lending segment", "source": "Market Analysis", "stock": "ICICIBANK.NS"},
        {"headline": "SBI posts record profit driven by lower provisions", "source": "Market Analysis", "stock": "SBIN.NS"},
        {"headline": "Kotak Mahindra Bank announces digital banking expansion", "source": "Market Analysis", "stock": "KOTAKBANK.NS"},
        {"headline": "JPMorgan raises outlook on strong investment banking revenue", "source": "Market Analysis", "stock": "JPM"},
        {"headline": "Axis Bank asset quality improves with declining NPAs", "source": "Market Analysis", "stock": "AXISBANK.NS"},
        {"headline": "Banking sector outlook remains positive amid rate cut expectations", "source": "Market Analysis", "stock": "sector"},
        {"headline": "Wells Fargo faces headwinds from regulatory compliance costs", "source": "Market Analysis", "stock": "WFC"},
        {"headline": "Goldman Sachs reports mixed results in trading division", "source": "Market Analysis", "stock": "GS"},
    ],
    'automobile': [
        {"headline": "Tata Motors EV sales surge 45% year-over-year", "source": "Market Analysis", "stock": "TATAMOTORS.NS"},
        {"headline": "Maruti Suzuki launches new SUV gaining strong market response", "source": "Market Analysis", "stock": "MARUTI.NS"},
        {"headline": "Tesla deliveries beat expectations in latest quarter", "source": "Market Analysis", "stock": "TSLA"},
        {"headline": "Mahindra & Mahindra farm equipment demand remains strong", "source": "Market Analysis", "stock": "M&M.NS"},
        {"headline": "Bajaj Auto exports grow steadily in key African markets", "source": "Market Analysis", "stock": "BAJAJ-AUTO.NS"},
        {"headline": "Hero MotoCorp faces pricing pressure in rural market", "source": "Market Analysis", "stock": "HEROMOTOCO.NS"},
        {"headline": "Auto sector benefits from festive season demand uptick", "source": "Market Analysis", "stock": "sector"},
        {"headline": "General Motors restructures operations amid EV transition", "source": "Market Analysis", "stock": "GM"},
        {"headline": "Ford motor reports decline in sedan sales segment", "source": "Market Analysis", "stock": "F"},
    ],
    'energy': [
        {"headline": "Reliance Industries expands green energy capacity significantly", "source": "Market Analysis", "stock": "RELIANCE.NS"},
        {"headline": "NTPC commissions new solar power plant in Rajasthan", "source": "Market Analysis", "stock": "NTPC.NS"},
        {"headline": "Power Grid Corporation wins transmission line contracts", "source": "Market Analysis", "stock": "POWERGRID.NS"},
        {"headline": "ExxonMobil profits surge on rising crude oil prices", "source": "Market Analysis", "stock": "XOM"},
        {"headline": "Chevron boosts dividend amid strong cash flow generation", "source": "Market Analysis", "stock": "CVX"},
        {"headline": "Oil India reports higher crude production volumes", "source": "Market Analysis", "stock": "OIL.NS"},
        {"headline": "Energy sector rallies on global supply concerns", "source": "Market Analysis", "stock": "sector"},
        {"headline": "Torrent Power expands renewable portfolio with wind assets", "source": "Market Analysis", "stock": "TORNTPOWER.NS"},
        {"headline": "ConocoPhillips announces strategic acquisition in Permian Basin", "source": "Market Analysis", "stock": "COP"},
    ],
    'pharma': [
        {"headline": "Sun Pharma wins FDA approval for a new specialty drug", "source": "Market Analysis", "stock": "SUNPHARMA.NS"},
        {"headline": "Cipla reports strong growth in domestic formulations", "source": "Market Analysis", "stock": "CIPLA.NS"},
        {"headline": "Dr Reddy's expands US generic pipeline with key filings", "source": "Market Analysis", "stock": "DRHP.NS"},
        {"headline": "Pfizer faces patent cliff concerns for major drug portfolio", "source": "Market Analysis", "stock": "PFE"},
        {"headline": "Lupin gains market share in respiratory and cardiovascular segments", "source": "Market Analysis", "stock": "LUPIN.NS"},
        {"headline": "AbbVie beats earnings estimates on Humira successor drugs", "source": "Market Analysis", "stock": "ABBV"},
        {"headline": "Pharma sector sees positive momentum on healthcare spending", "source": "Market Analysis", "stock": "sector"},
        {"headline": "Aurobindo Pharma expands biosimilar development program", "source": "Market Analysis", "stock": "AUROPHARMA.NS"},
        {"headline": "UnitedHealth Group raises full-year guidance on strong enrollment", "source": "Market Analysis", "stock": "UNH"},
    ],
    'fmcg': [
        {"headline": "Nestle India reports steady volume growth in dairy segment", "source": "Market Analysis", "stock": "NESTLEIND.NS"},
        {"headline": "Britannia expands rural distribution network significantly", "source": "Market Analysis", "stock": "BRITANNIA.NS"},
        {"headline": "Hindustan Unilever faces margin pressure from raw material costs", "source": "Market Analysis", "stock": "HINDUNILVR.NS"},
        {"headline": "Marico's Saffola brand posts strong urban sales numbers", "source": "Market Analysis", "stock": "MARICO.NS"},
        {"headline": "Procter & Gamble beats quarterly revenue expectations", "source": "Market Analysis", "stock": "PG"},
        {"headline": "Coca-Cola sees demand growth in emerging markets", "source": "Market Analysis", "stock": "KO"},
        {"headline": "FMCG sector outlook mixed on discretionary spending trends", "source": "Market Analysis", "stock": "sector"},
        {"headline": "Godrej Consumer Products launches premium personal care line", "source": "Market Analysis", "stock": "GODREJCP.NS"},
        {"headline": "Diageo premium spirits portfolio gains market traction", "source": "Market Analysis", "stock": "DEO"},
    ],
    'metals': [
        {"headline": "Tata Steel production hits all-time high at Jamshedpur plant", "source": "Market Analysis", "stock": "TATASTEEL.NS"},
        {"headline": "Hindalco benefits from rising aluminium prices globally", "source": "Market Analysis", "stock": "HINDALCO.NS"},
        {"headline": "JSW Steel reports strong export volumes amid global demand", "source": "Market Analysis", "stock": "JSWSTEEL.NS"},
        {"headline": "Vale iron ore shipments increase on China infrastructure push", "source": "Market Analysis", "stock": "VALE"},
        {"headline": "Rio Tinto copper output rises supporting revenue growth", "source": "Market Analysis", "stock": "RIO"},
        {"headline": "Jindal Steel announces capacity expansion at Odisha complex", "source": "Market Analysis", "stock": "JINDALSTEL.NS"},
        {"headline": "Metal prices rally on global supply chain disruptions", "source": "Market Analysis", "stock": "sector"},
        {"headline": "National Aluminium faces headwinds from rising input costs", "source": "Market Analysis", "stock": "NATIONALUM.NS"},
        {"headline": "Freeport-McMoRan sees strong copper demand from green energy", "source": "Market Analysis", "stock": "FCX"},
    ],
    'finance': [
        {"headline": "Bajaj Finance posts record loan disbursements in Q4", "source": "Market Analysis", "stock": "BAJFINANCE.NS"},
        {"headline": "HDFC Ltd merger integration progressing ahead of schedule", "source": "Market Analysis", "stock": "HDFC.NS"},
        {"headline": "Muthoot Finance gold loan portfolio grows steadily", "source": "Market Analysis", "stock": "MUTHOOTFIN.NS"},
        {"headline": "Blackstone raises new private equity fund surpassing targets", "source": "Market Analysis", "stock": "BX"},
        {"headline": "BlackRock AUM reaches record levels on market gains", "source": "Market Analysis", "stock": "BLK"},
        {"headline": "Cholamandalam reports strong vehicle finance growth", "source": "Market Analysis", "stock": "CHOLAFIN.NS"},
        {"headline": "NBFC sector faces tighter RBI regulations on lending", "source": "Market Analysis", "stock": "sector"},
        {"headline": "PFC sees improved recoveries from stressed power assets", "source": "Market Analysis", "stock": "PFC.NS"},
        {"headline": "KKR completes acquisition of major infrastructure platform", "source": "Market Analysis", "stock": "KKR"},
    ],
    'hospitality': [
        {"headline": "Indian Hotels reports strong RevPAR growth across portfolio", "source": "Market Analysis", "stock": "INDHOTEL.NS"},
        {"headline": "Chalet Hotels occupancy rates hit post-pandemic highs", "source": "Market Analysis", "stock": "CHALET.NS"},
        {"headline": "Marriott expands luxury portfolio with new global openings", "source": "Market Analysis", "stock": "MAR"},
        {"headline": "Royal Caribbean orders new cruise ships amid travel boom", "source": "Market Analysis", "stock": "RCL"},
        {"headline": "Hilton Worldwide reports record pipeline of new properties", "source": "Market Analysis", "stock": "HLT"},
        {"headline": "EIH Oberoi hotels see strong demand in leisure destinations", "source": "Market Analysis", "stock": "EIHOTEL.NS"},
        {"headline": "Hotel industry benefits from strong business travel recovery", "source": "Market Analysis", "stock": "sector"},
        {"headline": "Carnival cruise bookings reach all-time highs", "source": "Market Analysis", "stock": "CCL"},
        {"headline": "Taj GVK Hotels sees improved performance in Hyderabad market", "source": "Market Analysis", "stock": "TAJGVK.NS"},
    ],
    'realty': [
        {"headline": "DLF new project launches see strong sales momentum", "source": "Market Analysis", "stock": "DLF.NS"},
        {"headline": "Oberoi Realty premium segment bookings remain robust", "source": "Market Analysis", "stock": "OBEROI.NS"},
        {"headline": "Lodha Macrotech expands affordable housing portfolio", "source": "Market Analysis", "stock": "LODHA.NS"},
        {"headline": "Simon Property Group raises dividend on strong retail leasing", "source": "Market Analysis", "stock": "SPG"},
        {"headline": "Prologis warehouse demand surges on ecommerce growth", "source": "Market Analysis", "stock": "PLD"},
        {"headline": "Sunteck Realty reports strong pre-sales in Mumbai projects", "source": "Market Analysis", "stock": "SUNTECK.NS"},
        {"headline": "Real estate sector benefits from lower home loan rates", "source": "Market Analysis", "stock": "sector"},
        {"headline": "Godrej Properties expands land bank with new acquisitions", "source": "Market Analysis", "stock": "GPIL.NS"},
        {"headline": "Vornado Realty faces challenges in New York office market", "source": "Market Analysis", "stock": "VNO"},
    ],
    'capital_goods': [
        {"headline": "ABB India reports record order backlog in electrification segment", "source": "Market Analysis", "stock": "ABB.NS"},
        {"headline": "Siemens wins major infrastructure contract for high-speed rail", "source": "Market Analysis", "stock": "SIEMENS.NS"},
        {"headline": "Larsen & Toubro hydrocarbon business secures offshore projects", "source": "Market Analysis", "stock": "LT.NS"},
        {"headline": "Bharat Electronics sees strong demand for defense systems", "source": "Market Analysis", "stock": "BEL.NS"},
        {"headline": "BHEL commissions super-critical thermal power unit", "source": "Market Analysis", "stock": "BHEL.NS"},
        {"headline": "HAL receives order for light combat aircraft manufacturing", "source": "Market Analysis", "stock": "HAL.NS"},
        {"headline": "Capital goods sector outlook improves on infra spending", "source": "Market Analysis", "stock": "sector"},
    ],
    'telecom': [
        {"headline": "Bharti Airtel expands 5G coverage across major urban centers", "source": "Market Analysis", "stock": "BHARTIARTL.NS"},
        {"headline": "Vodafone Idea reports improved ARPU amid tariff hikes", "source": "Market Analysis", "stock": "IDEA.NS"},
        {"headline": "Indus Towers sees growth in tenancy ratios from 5G rollout", "source": "Market Analysis", "stock": "INDUSTOWER.NS"},
        {"headline": "Telecom sector benefits from increasing digital data consumption", "source": "Market Analysis", "stock": "sector"},
    ],
    'chemicals': [
        {"headline": "UPL expands agrochemical portfolio with sustainable solutions", "source": "Market Analysis", "stock": "UPL.NS"},
        {"headline": "Pidilite Industries reports strong demand for construction chemicals", "source": "Market Analysis", "stock": "PIDILITIND.NS"},
        {"headline": "SRF chemicals business benefits from high refrigerant demand", "source": "Market Analysis", "stock": "SRF.NS"},
        {"headline": "Chemical sector outlook remains positive on export potential", "source": "Market Analysis", "stock": "sector"},
    ],
    'consumer_durables': [
        {"headline": "Titan reports robust growth in jewelry and watches division", "source": "Market Analysis", "stock": "TITAN.NS"},
        {"headline": "Voltas maintains leadership in air conditioning market share", "source": "Market Analysis", "stock": "VOLTAS.NS"},
        {"headline": "Havells expands premium home appliance portfolio", "source": "Market Analysis", "stock": "HAVELLS.NS"},
        {"headline": "Consumer durables demand surges during festive sales season", "source": "Market Analysis", "stock": "sector"},
    ],
    'construction': [
        {"headline": "UltraTech Cement capacity expansion projects on track", "source": "Market Analysis", "stock": "ULTRACEMCO.NS"},
        {"headline": "Ambuja Cement benefits from logistics cost optimization", "source": "Market Analysis", "stock": "AMBUJACEM.NS"},
        {"headline": "RVNL receives major railway infrastructure contract", "source": "Market Analysis", "stock": "RVNL.NS"},
        {"headline": "Construction sector sees momentum from government infra push", "source": "Market Analysis", "stock": "sector"},
    ],
    'us_stocks': [
        {"headline": "Apple announces record-breaking iPhone sales quarter", "source": "Market Analysis", "stock": "AAPL"},
        {"headline": "Microsoft Azure cloud revenue grows 30% year-over-year", "source": "Market Analysis", "stock": "MSFT"},
        {"headline": "Google AI initiatives drive advertising revenue growth", "source": "Market Analysis", "stock": "GOOGL"},
        {"headline": "Amazon AWS maintains cloud market leadership", "source": "Market Analysis", "stock": "AMZN"},
        {"headline": "Meta platforms Reality Labs losses widen on VR investments", "source": "Market Analysis", "stock": "META"},
        {"headline": "Nvidia data center revenue soars on AI chip demand", "source": "Market Analysis", "stock": "NVDA"},
        {"headline": "Tesla expands Gigafactory capacity in key markets", "source": "Market Analysis", "stock": "TSLA"},
        {"headline": "Netflix subscriber growth exceeds Wall Street expectations", "source": "Market Analysis", "stock": "NFLX"},
        {"headline": "AMD gains market share in server processor segment", "source": "Market Analysis", "stock": "AMD"},
        {"headline": "Disney streaming profitability improves significantly", "source": "Market Analysis", "stock": "DIS"},
        {"headline": "Adobe AI features boost creative cloud subscriptions", "source": "Market Analysis", "stock": "ADBE"},
        {"headline": "Visa reports strong cross-border transaction volume growth", "source": "Market Analysis", "stock": "V"},
    ],
}


def clean_text(text):
    """Clean and normalize headline text."""
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[^\w\s\-.,!?\'\"$%&]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def scrape_sector_headlines(sector):
    """Scrape financial news headlines for a given sector."""
    headlines = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
    }

    sources = SECTOR_NEWS_SOURCES.get(sector, SECTOR_NEWS_SOURCES.get('us_stocks', []))

    for source in sources:
        try:
            response = requests.get(
                source['url'],
                headers=headers,
                timeout=8,
                allow_redirects=True
            )
            if response.status_code != 200:
                logger.warning(f"Failed to fetch {source['name']}: HTTP {response.status_code}")
                continue

            soup = BeautifulSoup(response.text, 'lxml')

            selectors = source['selector'].split(', ')
            found_links = []
            for sel in selectors:
                found_links.extend(soup.select(sel.strip()))

            for link in found_links[:20]:
                title = clean_text(link.get_text())
                if title and len(title) > 15:
                    headlines.append({
                        'headline': title,
                        'source': source['name'],
                    })

            logger.info(f"Scraped {len(found_links)} headlines from {source['name']}")

        except requests.exceptions.Timeout:
            logger.warning(f"Timeout scraping {source['name']}")
        except Exception as e:
            logger.warning(f"Error scraping {source['name']}: {str(e)}")

    return headlines


def match_headline_to_stock(headline_lower, sector):
    """Match a headline to a specific stock symbol in the sector."""
    stocks = Stock.objects.filter(sector=sector)
    matched_stocks = []

    for stock in stocks:
        # Check symbol
        raw_symbol = stock.symbol.replace('.NS', '').lower()
        if raw_symbol in headline_lower:
            matched_stocks.append(stock.symbol)
            continue
        
        # Check name (simplified)
        clean_name = stock.name.replace(' Ltd.', '').replace(' Limited', '').lower()
        # Check for first word of name (usually the brand)
        brand = clean_name.split()[0]
        if brand in headline_lower:
            matched_stocks.append(stock.symbol)
            continue

    # If no specific stock matched, assign to "sector" (applies to all)
    return matched_stocks if matched_stocks else ['sector']


def apply_rule_based_boost(text_lower):
    """Apply domain-specific keyword boosts to the sentiment score."""
    boost = 0.0
    for keyword, score in BULLISH_KEYWORDS.items():
        if keyword in text_lower:
            boost += score
    for keyword, score in BEARISH_KEYWORDS.items():
        if keyword in text_lower:
            boost += score
    return max(-0.5, min(0.5, boost))


def analyze_headlines(headlines, sector):
    """Perform VADER + rule-based sentiment analysis and match to stocks."""
    analyzer = SentimentIntensityAnalyzer()
    analyzed = []

    for item in headlines:
        text = item['headline']
        text_lower = text.lower()

        # VADER sentiment
        vader_scores = analyzer.polarity_scores(text)

        # Rule-based boost
        boost = apply_rule_based_boost(text_lower)

        # Combined score: VADER compound (60%) + domain boost (40%)
        combined_score = vader_scores['compound'] * 0.6 + boost * 0.4
        combined_score = max(-1.0, min(1.0, combined_score))

        # Classify
        if combined_score >= 0.1:
            classification = 'positive'
        elif combined_score <= -0.1:
            classification = 'negative'
        else:
            classification = 'neutral'

        # Match to stocks
        matched = match_headline_to_stock(text_lower, sector)

        analyzed.append({
            'headline': text,
            'source': item.get('source', 'Market Analysis'),
            'stocks': matched,
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


def aggregate_per_stock(analyzed_headlines, sector):
    """Aggregate sentiment per stock in the sector."""
    sector_symbols = get_sector_symbols(sector)
    stock_sentiments = {}

    for symbol in sector_symbols:
        # Collect headlines relevant to this stock (direct match + sector-wide)
        relevant = [
            h for h in analyzed_headlines
            if symbol in h['stocks'] or 'sector' in h['stocks']
        ]

        if not relevant:
            # No headlines found, assign neutral
            stock_sentiments[symbol] = {
                'overall_score': 0,
                'classification': 'Neutral',
                'confidence': 50,
                'positive_count': 0,
                'negative_count': 0,
                'neutral_count': 0,
                'total_headlines': 0,
                'prediction': 'Neutral',
            }
            continue

        scores = [h['combined_score'] for h in relevant]
        avg_score = sum(scores) / len(scores)

        positive_count = sum(1 for h in relevant if h['classification'] == 'positive')
        negative_count = sum(1 for h in relevant if h['classification'] == 'negative')
        neutral_count = sum(1 for h in relevant if h['classification'] == 'neutral')
        total = len(relevant)

        # Determine classification and prediction
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

        # Confidence calculation
        score_magnitude = abs(avg_score)
        consensus = max(positive_count, negative_count, neutral_count) / total if total > 0 else 0
        confidence = min(99, int(50 + score_magnitude * 40 + consensus * 20))

        stock_sentiments[symbol] = {
            'overall_score': round(avg_score, 4),
            'classification': classification,
            'confidence': confidence,
            'positive_count': positive_count,
            'negative_count': negative_count,
            'neutral_count': neutral_count,
            'total_headlines': total,
            'prediction': prediction,
        }

    return stock_sentiments


def analyze_sector_sentiment(sector):
    """Main function: scrape, analyze, and aggregate sentiment for a sector's stocks."""
    sector = sector.lower()

    # Scrape real headlines
    headlines = scrape_sector_headlines(sector)

    # If too few scraped, supplement with fallback
    fallback = SECTOR_FALLBACK_HEADLINES.get(sector, [])
    if len(headlines) < 5:
        logger.info(f"Only {len(headlines)} scraped headlines for {sector}, adding fallback data")
        # Convert fallback to same format
        for fb in fallback:
            headlines.append({
                'headline': fb['headline'],
                'source': fb['source'],
            })

    # Analyze sentiment
    analyzed = analyze_headlines(headlines, sector)

    # Aggregate per stock
    stock_sentiments = aggregate_per_stock(analyzed, sector)

    # Top headlines for the sector (sorted by absolute score)
    top_headlines = sorted(
        analyzed,
        key=lambda x: abs(x['combined_score']),
        reverse=True
    )[:15]

    # Remove 'stocks' key from headline output (not needed in frontend)
    clean_headlines = []
    for h in top_headlines:
        clean_headlines.append({
            'headline': h['headline'],
            'source': h['source'],
            'vader_score': h['vader_score'],
            'rule_boost': h['rule_boost'],
            'combined_score': h['combined_score'],
            'classification': h['classification'],
            'scores': h['scores'],
        })

    return {
        'stocks': stock_sentiments,
        'headlines': clean_headlines,
        'metadata': {
            'sector': sector,
            'total_headlines_scraped': len(headlines),
            'total_analyzed': len(analyzed),
            'stocks_analyzed': len(stock_sentiments),
            'sources_used': list(set(h.get('source', '') for h in headlines)),
            'analysis_timestamp': datetime.now().isoformat(),
            'method': 'VADER + Rule-Based Domain Analysis',
        }
    }
