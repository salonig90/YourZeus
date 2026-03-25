"""
LangGraph Orchestration — routes queries through agent nodes.
Graph: classify_intent → check_auth → execute_agent → log
Falls back gracefully if langgraph isn't installed.
"""
import logging
from typing import TypedDict, Literal, Optional

logger = logging.getLogger(__name__)


class GraphState(TypedDict):
    query: str
    session_id: str
    user_id: Optional[int]
    is_private: bool
    intent: str
    response: str
    action: Optional[str]
    symbol: Optional[str]
    stock_name: Optional[str]
    price: Optional[float]
    requires_mpin: bool
    requires_auth: bool
    error: Optional[str]


def _node_classify(state: GraphState) -> GraphState:
    from .agents.classifier import classify_intent
    intent = classify_intent(state['query'], state['user_id'])
    return {**state, 'intent': intent}


def _node_execute(state: GraphState) -> GraphState:
    intent = state['intent']
    query = state['query']
    user_id = state['user_id']

    try:
        if intent == 'recommendation':
            from .agents.recommendation import run
        elif intent == 'portfolio':
            from .agents.portfolio import run
        elif intent == 'forecasting':
            from .agents.forecasting import run
        else:
            from .agents.qa import run

        result = run(query, user_id)
        return {**state, **result}
    except Exception as e:
        logger.error(f"Agent execution failed for intent={intent}: {e}")
        return {
            **state,
            'response': (
                "⚡ **Zeus AI is temporarily unavailable.**\n\n"
                "Our AI systems are experiencing high load. Please try again in a moment.\n"
                "In the meantime, check the live market data in the Stocks and Metals pages."
            ),
            'intent': 'error',
            'error': str(e)
        }


def _node_check_portfolio_auth(state: GraphState) -> GraphState:
    """If portfolio action and user not logged in, block it."""
    if state['intent'] == 'portfolio' and not state['is_private']:
        return {
            **state,
            'response': (
                "🔐 **Login Required**\n\n"
                "Portfolio actions require you to be logged in.\n"
                "Please sign in to add or remove stocks from your portfolio."
            ),
            'requires_auth': True,
            'requires_mpin': False,
        }
    return state


def run_graph(
    query: str,
    session_id: str,
    user_id: int | None = None,
    is_private: bool = False,
) -> dict:
    """
    Main entry point. Tries to use LangGraph if available, else sequential pipeline.
    """
    initial_state: GraphState = {
        'query': query,
        'session_id': session_id,
        'user_id': user_id,
        'is_private': is_private,
        'intent': 'qa',
        'response': '',
        'action': None,
        'symbol': None,
        'stock_name': None,
        'price': None,
        'requires_mpin': False,
        'requires_auth': False,
        'error': None,
    }

    try:
        from langgraph.graph import StateGraph, END

        builder = StateGraph(GraphState)
        builder.add_node('classify', _node_classify)
        builder.add_node('check_auth', _node_check_portfolio_auth)
        builder.add_node('execute', _node_execute)

        builder.set_entry_point('classify')
        builder.add_edge('classify', 'check_auth')

        def _route_after_auth(state: GraphState) -> Literal['execute', END]:
            if state.get('requires_auth') and not state['is_private']:
                return END
            return 'execute'

        builder.add_conditional_edges('check_auth', _route_after_auth, {
            'execute': 'execute',
            END: END
        })
        builder.add_edge('execute', END)

        graph = builder.compile()
        final = graph.invoke(initial_state)
        logger.info(f"LangGraph: intent={final.get('intent')}, session={session_id}")
        return dict(final)

    except ImportError:
        # LangGraph not installed — run sequential pipeline
        logger.info("LangGraph not available, running sequential pipeline")
        state = _node_classify(initial_state)
        state = _node_check_portfolio_auth(state)
        if not state.get('requires_auth'):
            state = _node_execute(state)
        return dict(state)

    except Exception as e:
        logger.error(f"Graph execution error: {e}")
        state = _node_classify(initial_state)
        state = _node_execute(state)
        return dict(state)
