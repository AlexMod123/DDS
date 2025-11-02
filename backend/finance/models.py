from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator

class Status(models.Model):
    name = models.CharField("Название", max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self): return self.name
    class Meta: verbose_name_plural = "Статусы"

class TransactionType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    is_income = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    def __str__(self): return self.name
    class Meta: verbose_name_plural = "Типы операций"

class Category(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategories')
    status = models.ForeignKey(Status, on_delete=models.PROTECT, related_name='categories')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.parent} → {self.name}" if self.parent else self.name
    class Meta:
        unique_together = ('name', 'parent')
        verbose_name_plural = "Категории"

class Transaction(models.Model):
    created_at = models.DateField(default=timezone.now)
    status = models.ForeignKey(Status, on_delete=models.PROTECT)
    transaction_type = models.ForeignKey(TransactionType, on_delete=models.PROTECT)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0.01)])
    comment = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['created_at']), models.Index(fields=['status'])]