from rest_framework import viewsets
from .models import Status, TransactionType, Category, Transaction
from .serializers import *

class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.filter(is_active=True)
    serializer_class = StatusSerializer

class TransactionTypeViewSet(viewsets.ModelViewSet):
    queryset = TransactionType.objects.filter(is_active=True)
    serializer_class = TransactionTypeSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.select_related('parent', 'status').filter(is_active=True)
    serializer_class = CategorySerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('status', 'transaction_type', 'category')
    serializer_class = TransactionSerializer
    filterset_fields = ['status', 'transaction_type', 'category', 'created_at']