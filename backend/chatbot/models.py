from django.db import models


class ChatLog(models.Model):
    """Records every chatbot interaction for analytics and debugging."""
    user_id = models.IntegerField(null=True, blank=True)  # null for public/anonymous mode
    session_id = models.CharField(max_length=100, db_index=True)
    query = models.TextField()
    response = models.TextField()
    intent = models.CharField(max_length=50, default='general')
    is_private = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_logs'
        ordering = ['-timestamp']

    def __str__(self):
        mode = 'private' if self.is_private else 'public'
        return f"[{mode}] {self.intent} @ {self.timestamp:%Y-%m-%d %H:%M}"
