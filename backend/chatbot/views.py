"""
Main chat API endpoint for Zeus AI Chatbot.
Supports public (anonymous) and private (authenticated) modes.
"""
import logging
import uuid
from datetime import datetime

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken

logger = logging.getLogger(__name__)


def _get_user_from_token(request) -> int | None:
    """Extract user_id from JWT Bearer token if present."""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    try:
        token_str = auth_header.split(' ', 1)[1]
        token = AccessToken(token_str)
        return token.get('user_id') or token.get('id')
    except Exception:
        return None


@api_view(['POST', 'OPTIONS'])
@permission_classes([AllowAny])
def chat(request):
    """
    POST /api/chat/
    Body: { "query": str, "session_id": str (optional) }
    Headers: Authorization: Bearer <token>  (optional, enables private mode)
    """
    if request.method == 'OPTIONS':
        return Response(status=status.HTTP_200_OK)

    query = (request.data.get('query') or '').strip()
    session_id = request.data.get('session_id') or str(uuid.uuid4())

    if not query:
        return Response(
            {'success': False, 'message': 'query is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(query) > 1000:
        return Response(
            {'success': False, 'message': 'Query too long (max 1000 characters).'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Determine mode
    user_id = _get_user_from_token(request)
    is_private = user_id is not None

    # Save to conversation memory
    try:
        from .memory import get_context, save_turn
        context = get_context(session_id)
    except Exception:
        context = ''
        save_turn = None

    # Run the LangGraph pipeline
    try:
        from .graph import run_graph
        result = run_graph(
            query=query,
            session_id=session_id,
            user_id=user_id,
            is_private=is_private,
        )
    except Exception as e:
        logger.error(f"Graph error: {e}")
        result = {
            'response': (
                "⚡ **Zeus AI Temporarily Unavailable**\n\n"
                "Our AI engine is currently restarting. Please try again in a moment.\n"
                "You can still browse live stock data on the Stocks and Metals pages."
            ),
            'intent': 'error',
            'requires_mpin': False,
            'requires_auth': False,
        }

    response_text = result.get('response', '')
    intent = result.get('intent', 'qa')

    # Save conversation turn to memory
    if save_turn:
        try:
            save_turn(session_id, query, response_text, intent)
        except Exception:
            pass

    # Log to ChatLog table
    try:
        from .models import ChatLog
        ChatLog.objects.create(
            user_id=user_id,
            session_id=session_id,
            query=query,
            response=response_text[:2000],
            intent=intent,
            is_private=is_private,
        )
    except Exception as log_err:
        logger.warning(f"ChatLog save failed: {log_err}")

    return Response({
        'success': True,
        'session_id': session_id,
        'query': query,
        'response': response_text,
        'intent': intent,
        'is_private': is_private,
        'requires_mpin': result.get('requires_mpin', False),
        'requires_auth': result.get('requires_auth', False),
        'action': result.get('action'),
        'symbol': result.get('symbol'),
        'stock_name': result.get('stock_name'),
        'price': result.get('price'),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def chat_history(request):
    """GET /api/chat/history/?session_id=<id> — returns last 20 messages."""
    session_id = request.query_params.get('session_id')
    if not session_id:
        return Response({'success': False, 'message': 'session_id required'},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        from .models import ChatLog
        logs = ChatLog.objects.filter(session_id=session_id).order_by('timestamp')[:20]
        data = [
            {
                'query': log.query,
                'response': log.response,
                'intent': log.intent,
                'timestamp': log.timestamp.isoformat(),
            }
            for log in logs
        ]
        return Response({'success': True, 'history': data})
    except Exception as e:
        return Response({'success': False, 'error': str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
