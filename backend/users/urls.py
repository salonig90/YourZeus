from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('token/refresh/', views.refresh_token, name='token_refresh'),
    path('me/', views.get_current_user, name='current_user'),
    path('metals/prices/', views.get_live_metals_prices, name='live_metals_prices'),
    path('mutual-funds/', views.get_mutual_funds, name='get_mutual_funds'),
    path('stocks/sector/<str:sector>/', views.get_sector_stocks, name='sector_stocks'),
    path('portfolio/add/', views.add_to_portfolio, name='add_to_portfolio'),
    path('portfolio/', views.get_portfolio, name='get_portfolio'),
    path('stocks/sector/<str:sector>/refresh/', views.refresh_sector_prices, name='refresh_sector_prices'),
    path('activities/', views.activity_dashboard, name='activity_dashboard'),
    path('newsletter/subscribe/', views.subscribe_newsletter, name='subscribe_newsletter'),
    path('payments/dummy/', views.process_dummy_payment, name='process_dummy_payment'),
    path('metals/sentiment/', views.get_metals_sentiment, name='metals_sentiment'),
    path('stocks/sector/<str:sector>/sentiment/', views.get_stock_sentiment, name='stock_sentiment'),
    path('admin/stocks/', views.manage_stocks, name='manage_stocks'),
    path('admin/stocks/<str:symbol>/', views.manage_stocks, name='remove_stock'),
    # MPIN endpoints
    path('set-mpin/', views.set_mpin, name='set_mpin'),
    path('verify-mpin/', views.verify_mpin, name='verify_mpin'),
    # Forgot Password (Access Key) endpoints
    path('forgot-password/request/', views.request_forgot_password_otp, name='forgot_password_request'),
    path('forgot-password/verify/', views.verify_forgot_password_otp, name='forgot_password_verify'),
]