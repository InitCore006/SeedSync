"""Notifications Views"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification, PushToken
from .serializers import NotificationSerializer, PushTokenSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.filter(is_active=True)
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'Marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'All marked as read'})

class PushTokenViewSet(viewsets.ModelViewSet):
    queryset = PushToken.objects.filter(is_active=True)
    serializer_class = PushTokenSerializer
    permission_classes = [IsAuthenticated]
