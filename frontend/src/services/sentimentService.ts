// Sentiment Analysis Service - Fetches gold & silver sentiment from backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface SentimentScores {
  positive: number;
  negative: number;
  neutral: number;
}

export interface HeadlineData {
  headline: string;
  source: string;
  metal: string;
  vader_score: number;
  rule_boost: number;
  combined_score: number;
  classification: 'positive' | 'negative' | 'neutral';
  scores: SentimentScores;
}

export interface MetalSentiment {
  overall_score: number;
  classification: string;
  confidence: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  total_headlines: number;
  prediction: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface MetalSentimentData {
  sentiment: MetalSentiment;
  headlines: HeadlineData[];
}

export interface SentimentResponse {
  gold: MetalSentimentData;
  silver: MetalSentimentData;
  metadata: {
    total_headlines_scraped: number;
    total_analyzed: number;
    sources_used: string[];
    analysis_timestamp: string;
    method: string;
  };
}

// Cache to avoid too many API calls
let cachedData: SentimentResponse | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchMetalsSentiment = async (): Promise<SentimentResponse> => {
  // Return cached data if still valid
  if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedData;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/metals/sentiment/`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid response');
    }
    
    cachedData = result.data;
    cacheTimestamp = Date.now();
    return result.data;
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    
    // Return fallback sentiment data
    return getFallbackSentiment();
  }
};

const getFallbackSentiment = (): SentimentResponse => {
  return {
    gold: {
      sentiment: {
        overall_score: 0.25,
        classification: 'Mildly Bullish',
        confidence: 72,
        positive_count: 6,
        negative_count: 2,
        neutral_count: 2,
        total_headlines: 10,
        prediction: 'Bullish',
      },
      headlines: [
        {
          headline: 'Gold prices steady near record highs amid global uncertainty',
          source: 'Market Analysis',
          metal: 'gold',
          vader_score: 0.15,
          rule_boost: 0.2,
          combined_score: 0.17,
          classification: 'positive',
          scores: { positive: 0.25, negative: 0.05, neutral: 0.70 },
        },
        {
          headline: 'Central banks continue gold accumulation in 2026',
          source: 'Market Analysis',
          metal: 'gold',
          vader_score: 0.12,
          rule_boost: 0.15,
          combined_score: 0.13,
          classification: 'positive',
          scores: { positive: 0.20, negative: 0.0, neutral: 0.80 },
        },
        {
          headline: 'Gold rallies as inflation concerns persist globally',
          source: 'Market Analysis',
          metal: 'gold',
          vader_score: -0.05,
          rule_boost: 0.25,
          combined_score: 0.07,
          classification: 'neutral',
          scores: { positive: 0.10, negative: 0.15, neutral: 0.75 },
        },
      ],
    },
    silver: {
      sentiment: {
        overall_score: 0.10,
        classification: 'Neutral',
        confidence: 58,
        positive_count: 3,
        negative_count: 2,
        neutral_count: 3,
        total_headlines: 8,
        prediction: 'Neutral',
      },
      headlines: [
        {
          headline: 'Silver demand rises on industrial and investment buying',
          source: 'Market Analysis',
          metal: 'silver',
          vader_score: 0.20,
          rule_boost: 0.15,
          combined_score: 0.18,
          classification: 'positive',
          scores: { positive: 0.30, negative: 0.05, neutral: 0.65 },
        },
        {
          headline: 'Silver prices hold steady with mixed market signals',
          source: 'Market Analysis',
          metal: 'silver',
          vader_score: 0.0,
          rule_boost: 0.0,
          combined_score: 0.0,
          classification: 'neutral',
          scores: { positive: 0.10, negative: 0.10, neutral: 0.80 },
        },
      ],
    },
    metadata: {
      total_headlines_scraped: 15,
      total_analyzed: 15,
      sources_used: ['Market Analysis (Fallback)'],
      analysis_timestamp: new Date().toISOString(),
      method: 'VADER + Rule-Based Domain Analysis (Fallback)',
    },
  };
};
