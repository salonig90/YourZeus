from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Stock, PortfolioStock

import secrets

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'first_name', 'last_name', 'api_key', 'date_joined')
        read_only_fields = ('id', 'date_joined', 'api_key')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        min_length=1,
        style={'input_type': 'password'},
        error_messages={
            'required': 'Password is required.'
        }
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        min_length=1,
        style={'input_type': 'password'},
        error_messages={
            'required': 'Password confirmation is required.'
        }
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'phone', 'password', 'password_confirm', 'first_name', 'last_name', 'telegram_chat_id')
        extra_kwargs = {
            'email': {
                'required': True,
                'error_messages': {
                    'required': 'Email is required.',
                    'invalid': 'Enter a valid email address.'
                }
            },
            'username': {
                'required': True,
                'error_messages': {
                    'required': 'Username is required.'
                }
            },
            'phone': {
                'required': False,
            }
        }

    def validate_email(self, value):
        # Check for duplicate email
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_username(self, value):
        # Check for duplicate username
        if User.objects.filter(username=value.lower()).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value.lower()

    def validate_phone(self, value):
        # Accept any phone format or empty
        return value if value else ''

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        password_confirm = validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        
        # Create user with hashed password
        user = User.objects.create_user(**validated_data)
        user.set_password(password)  # This hashes the password
        
        # Generate unique API key for every new user
        while True:
            new_api_key = f"zeus_{secrets.token_hex(16)}"
            if not User.objects.filter(api_key=new_api_key).exists():
                user.api_key = new_api_key
                break
        
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            # Try authenticating with the username field directly
            user = authenticate(username=username, password=password)
            
            # If that fails, try looking up by email (since frontend sends email as username)
            if not user:
                try:
                    user_obj = User.objects.get(email=username.lower())
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass

            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
        else:
            raise serializers.ValidationError('Must include username and password')

        attrs['user'] = user
        return attrs


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = (
            'symbol', 'name', 'sector', 'current_price', 'change', 
            'change_percent', 'day_high', 'day_low', 'pe_ratio', 
            'market_cap', 'volume', 'last_updated'
        )
        read_only_fields = ('last_updated',)


class PortfolioStockSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    
    class Meta:
        model = PortfolioStock
        fields = ('id', 'stock', 'sector', 'quantity', 'buying_price', 'added_at', 'updated_at')
        read_only_fields = ('added_at', 'updated_at')
