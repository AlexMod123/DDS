from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('statuses', views.StatusViewSet)
router.register('types', views.TransactionTypeViewSet)
router.register('categories', views.CategoryViewSet)
router.register('transactions', views.TransactionViewSet)

urlpatterns = [path('', include(router.urls))]