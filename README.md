# 📈 YourFinance - Investment & Portfolio Management Platform

A modern, real-time financial investment platform that combines stock analysis, precious metals tracking, and advanced data visualization to help you make informed investment decisions.

## 🌟 Features

### 📊 Portfolio Management
- **Add/Remove Stocks**: Easily add stocks from various sectors to your personalized portfolio
- **Real-Time Updates**: Live stock price data with percentage changes
- **Individual Stock Analytics**:
  - 📈 PE Ratio Trend Charts (12-month history)
  - 🎯 K-Means Clustering Analysis (compare with similar stocks)
- **Portfolio-Level Clustering**: View all stocks clustered by performance
  - 🟢 High Growth (change > 5%)
  - 🟡 Stable (-2% to 5%)
  - 🔴 Declining (change < -2%)

### 📈 Market Sectors
- **Browse Stocks by Sector**:
  - 🚗 Automobile
  - 🏢 IT/Technology
  - 🏨 Hospitality
  - 💼 Finance
  - 🏦 Banking
- **Stock Details**: Price, P/E ratio, Market Cap, EPS, Daily change
- **Investment Signals**: Buy/Hold/Sell recommendations for each stock
- **Quick Add**: One-click stock addition to your portfolio

### 💰 Precious Metals Trading
- **Real-Time Gold & Silver Prices**: Updated every 30 seconds
- **Live Price Indicators**: Visual feedback of price movements
- **12-Month Price Trends**: Historical price charts for both metals
- **Correlation Analysis**: Understand the relationship between gold and silver prices
- **Statistical Metrics**: R-squared, regression analysis for correlation

### 📰 Financial News
- **Featured Stories**: Latest and most important financial news
- **Category Filtering**: Browse news by category
  - Markets
  - Commodities
  - Economy
  - Analysis
  - Education
- **Search Functionality**: Find news by keyword
- **News Sources**: See publication sources for credibility

### 🤖 AI Assistant Chatbot
- **Interactive Help**: Ask questions about how to use the app
- **Smart FAQ System**: Natural language understanding
- **Topics Covered**:
  - Portfolio management
  - Stock sectors and browsing
  - Chart interpretation
  - Clustering analysis
  - Metals tracking
  - Navigation help

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- Django (v5.2+)
- PM2 (optional, for process management)

### Installation & Running

#### Option 1: Using PM2 (Recommended)
The project includes an `ecosystem.config.js` for managing both frontend and backend processes simultaneously.
```bash
npm install
npm start
```

#### Option 2: Manual Setup

**Backend Setup**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

**Frontend Setup**
```bash
cd frontend
npm install
npm start
```

- **Frontend Application**: `http://localhost:3000`
- **Admin & Monitoring Dashboard**: `http://localhost:8000`

## 📱 Pages & Routes

### Frontend (localhost:3000)
| Page | Route | Description |
|------|-------|-------------|
| Home/News | / | Financial news and market updates |
| News | /news | Detailed financial news feed |
| Gold & Silver | /gold-silver | Precious metals tracking |
| Market Sectors | /stocks | Browse stocks by sector |
| Sector Stocks | /stocks/:sector | Individual sector stock listings |
| Vault | /portfolio | Your personal stock portfolio (Auth required) |
| Sign Up | /signup | User registration and login |

### Backend Admin (localhost:8000)
| Feature | Description |
|---------|-------------|
| Activity Monitor | Real-time feed of user actions (signups, logins, payments) |
| Stock Management | **Exclusive** interface to add, edit, or remove stocks from the system |
| User Stats | Overview of unique users, new customers, and newsletter subscriptions |
| Payment Logs | View record of dummy transactions and card details (last 4 digits) |

## 🛠️ Security & Architecture

### Admin Separation
The stock editing functionality has been moved exclusively to the **Backend Admin Dashboard (localhost:8000)**. This ensures that only authorized administrators can modify the system's stock database, while the frontend remains a clean, performant interface for investors.

### Navbar Architecture
The frontend features a modern, centered "Pill" navbar with:
- **Responsive Centering**: Uses a wrapper-based layout to ensure perfect horizontal alignment across all screen sizes.
- **Dynamic Content**: Automatically adjusts based on authentication state (showing "VAULT" and "LOGOUT" for logged-in users).
- **Glassmorphism**: High-blur backdrop with linear-gradient borders for a futuristic look.

## 🎯 How to Use

### Adding Stocks to Portfolio
1. Navigate to **📈 Market Sectors**
2. Click on a sector that interests you (e.g., "Automobile")
3. View all stocks in that sector with their details
4. Click the **"Add"** button on any stock
5. Go to **💼 My Portfolio** to see your added stocks

### Viewing Stock Analysis
1. Go to **💼 My Portfolio**
2. Click on any stock card
3. View the expanded details including:
   - **PE Ratio Trend**: 12-month PE ratio progression
   - **K-Means Clustering**: See how this stock compares to similar ones
4. Click **"Close"** to return to grid view

### Understanding the Portfolio Clustering
- The **Portfolio Cluster Card** at the top shows all your stocks
- Each dot represents one stock
- X-axis: Stock price (higher = right)
- Y-axis: Daily change percentage (positive = up)
- Color indicates performance classification

### Tracking Precious Metals
1. Go to **💰 Gold & Silver**
2. View real-time prices updated every 30 seconds
3. Check the **12-Month Trend Charts** to see historical prices
4. Review the **Correlation Analysis** to understand price relationships

### Staying Updated with News
1. Visit **📰 News** (default page)
2. Use **Search** to find specific news topics
3. Click **Category Buttons** to filter by topic
4. Read the **Featured Story** for the latest important news
5. Click **"Read"** to view full articles

## 🔐 Authentication

- **Register**: Create a new account at /signup
- **Login**: Sign in with your credentials
- **Portfolio Access**: Portfolio page requires authentication
- **Token Storage**: Authentication tokens stored securely in localStorage

## 📊 Data & APIs

### Real-Time Data Sources
- **Stocks**: Yahoo Finance (via yfinance)
- **Precious Metals**: Alpha Vantage API
- **Market Data**: Real-time updates every 30 seconds

### Mock Data
- Sample Indian stock data for demonstration
- Static historical data for charts (when live API unavailable)

## 🛠️ Technology Stack

### Frontend
- **React 19.2**: Modern UI library
- **TypeScript**: Type-safe development
- **Styled Components**: CSS-in-JS styling
- **Framer Motion**: Smooth animations
- **Recharts**: Data visualization and charts
- **React Router**: Navigation

### Backend
- **Django**: Web framework
- **Django REST Framework**: API development
- **Python**: Backend language
- **SQLite**: Database

### Charts & Visualization
- **Recharts**: 
  - LineCharts for PE ratio trends
  - ScatterCharts for K-means clustering
  - Custom tooltip rendering

## 💡 Key Concepts

### PE Ratio (Price-to-Earnings)
The ratio of a stock's price to its earnings per share. Lower PE ratios often indicate undervalued stocks.

### K-Means Clustering
A machine learning algorithm that groups stocks into clusters based on their performance characteristics:
- Groups by price and change percentage
- Helps identify stocks with similar behavior
- Useful for portfolio diversification

### Stock Categories
- **Buy**: Stock shows strong growth potential
- **Hold**: Stock is stable, monitor for better entry
- **Sell**: Stock shows declining trend, consider exiting

## 🔄 Real-Time Features
- Live stock price updates
- Portfolio synchronization
- News feed auto-refresh
- Metal prices updated every 30 seconds
- Smooth animations and transitions

## 🌐 Responsive Design
- Works on desktop, tablet, and mobile
- Glassmorphism UI with blur effects
- Dark theme optimized for all devices
- Touch-friendly buttons and controls

## 📖 Chatbot Commands
The chatbot recognizes these topics:
- "portfolio" - How to manage your portfolio
- "add stock" - How to add stocks
- "pe ratio" - Explain PE ratio graph
- "clustering" - Explain K-means clustering
- "news" - News page features
- "gold/silver" - Precious metals tracking
- "help" - General assistance

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change Docker port or find the process using the port
# Backend: Change port in manage.py runserver command
python manage.py runserver 8001

# Frontend: Change port in package.json or terminal
npm start -- --port 3001
```

### API Connection Issues
- Ensure backend is running on http://localhost:8000
- Check network tab in browser DevTools
- Verify API endpoints in frontend services

### Login Issues
- Clear browser cache and localStorage
- Ensure backend database is migrated
- Check if user exists in database

## 📝 Project Structure

```
yourfinance/
├── backend/
│   ├── manage.py
│   ├── db.sqlite3
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── users/
│       ├── models.py
│       ├── views.py
│       ├── serializers.py
│       └── urls.py
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── Chatbot.tsx
    │   │   ├── PERatioGraph.tsx
    │   │   ├── KMeansClusteringGraph.tsx
    │   │   ├── CombinedKMeansClustering.tsx
    │   │   └── ...
    │   ├── pages/
    │   │   ├── Portfolio.tsx
    │   │   ├── GoldSilver.tsx
    │   │   ├── News.tsx
    │   │   ├── Stocks.tsx
    │   │   ├── SectorStocks.tsx
    │   │   └── Signup.tsx
    │   ├── services/
    │   │   ├── authService.ts
    │   │   ├── metalsApi.ts
    │   │   ├── yfinanceService.ts
    │   │   └── staticHistoricalData.ts
    │   ├── contexts/
    │   │   └── AuthContext.tsx
    │   └── App.tsx
    └── package.json
```

## 🚢 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the build folder
```

### Backend Deployment (Heroku/PythonAnywhere)
```bash
cd backend
gunicorn backend.wsgi:application
```

## 📄 License
This project is open source and available under the MIT License.

## 🤝 Contributing
Contributions are welcome! Feel free to fork and submit pull requests.

## 📞 Support
For issues or questions, please open an issue on GitHub or contact our support team.

## 🎯 Roadmap
- [ ] Mobile app (React Native)
- [ ] Advanced technical analysis indicators
- [ ] Backtesting system
- [ ] Paper trading simulation
- [ ] Email notifications
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] Export portfolio reports

---

**Happy Investing! 🚀📈**
