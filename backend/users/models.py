from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True, null=True)
    api_key = models.CharField(max_length=50, blank=True, null=True, unique=True)
    mpin = models.CharField(max_length=128, blank=True, null=True)  # Stored as Django hashed password
    telegram_chat_id = models.CharField(max_length=50, blank=True, null=True)
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_expiry = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


class Stock(models.Model):
    """Model to store stock data fetched from yfinance"""
    symbol = models.CharField(max_length=20, unique=True, primary_key=True)
    name = models.CharField(max_length=255)
    sector = models.CharField(max_length=50)
    current_price = models.FloatField()
    change = models.FloatField(default=0)
    change_percent = models.FloatField(default=0)
    day_high = models.FloatField(default=0)
    day_low = models.FloatField(default=0)
    pe_ratio = models.FloatField(default=0)
    market_cap = models.BigIntegerField(default=0)
    volume = models.BigIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'stocks'
        ordering = ['-last_updated']

    def __str__(self):
        return f"{self.symbol} - {self.name}"


class PortfolioStock(models.Model):
    """Model to store user's portfolio stocks organized by sector"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolio_stocks')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    sector = models.CharField(max_length=50)  # Sector from which stock was added
    quantity = models.IntegerField(default=1)
    buying_price = models.FloatField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'portfolio_stocks'
        unique_together = ('user', 'stock')
        ordering = ['sector', 'stock__symbol']

    def __str__(self):
        return f"{self.user.username} - {self.stock.symbol} ({self.sector})"


class UserActivity(models.Model):
    """Model to track user activities in the application"""
    ACTION_CHOICES = [
        ('SIGNUP', 'User Signup'),
        ('LOGIN', 'User Login'),
        ('LOGOUT', 'User Logout'),
        ('ADD_STOCK', 'Added Stock to Portfolio'),
        ('REMOVE_STOCK', 'Removed Stock from Portfolio'),
        ('VIEW_STOCKS', 'Viewed Sector Stocks'),
        ('VIEW_PORTFOLIO', 'Viewed Portfolio'),
        ('VIEW_METALS', 'Viewed Metals Prices'),
        ('API_ACCESS', 'Accessed API Endpoint'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities', null=True, blank=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField(blank=True, null=True)
    api_key_used = models.CharField(max_length=100, blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_activities'
        ordering = ['-timestamp']

    def __str__(self):
        user_name = self.user.username if self.user else "Anonymous"
        return f"{user_name} - {self.action} at {self.timestamp}"


class NewsletterSubscription(models.Model):
    """Model to store newsletter subscribers"""
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'newsletter_subscriptions'

    def __str__(self):
        return self.email


class PaymentRecord(models.Model):
    """Model to store dummy payment details"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    amount = models.FloatField()
    card_number = models.CharField(max_length=16)  # Dummy card number
    expiry = models.CharField(max_length=5)
    cvv = models.CharField(max_length=3)
    status = models.CharField(max_length=20, default='SUCCESS')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_records'

    def __str__(self):
        return f"Payment of ${self.amount} by {self.user.email}"