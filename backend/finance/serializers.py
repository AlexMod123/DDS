from rest_framework import serializers
from .models import Status, TransactionType, Category, Transaction

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.StringRelatedField(read_only=True)
    parent_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(parent=None), source='parent', write_only=True, required=False, allow_null=True
    )
    status = serializers.StringRelatedField()
    status_id = serializers.PrimaryKeyRelatedField(queryset=Status.objects.all(), source='status', write_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'parent_id', 'status', 'status_id', 'is_active']

class TransactionSerializer(serializers.ModelSerializer):
    status = serializers.StringRelatedField()
    status_id = serializers.PrimaryKeyRelatedField(queryset=Status.objects.all(), source='status', write_only=True)
    transaction_type = serializers.StringRelatedField()
    transaction_type_id = serializers.PrimaryKeyRelatedField(queryset=TransactionType.objects.all(), source='transaction_type', write_only=True)
    category = serializers.StringRelatedField()
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True)

    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['id']