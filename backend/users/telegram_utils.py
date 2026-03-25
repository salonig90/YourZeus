import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def send_telegram_otp(chat_id, otp_code):
    """
    Send OTP code to a Telegram chat.
    Requires TELEGRAM_BOT_TOKEN in settings/.env
    """
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN not found in settings")
        return False
    
    message = f"🔐 Your NEXUS verification code is: {otp_code}. Valid for 5 minutes."
    
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'Markdown'
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            logger.info(f"OTP sent to Telegram chat {chat_id}")
            return True
        else:
            logger.error(f"Telegram API Error (Status {response.status_code}): {response.text}")
            return False
    except Exception as e:
        logger.error(f"Exception while sending Telegram OTP: {str(e)}")
        return False
