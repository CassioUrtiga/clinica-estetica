from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('validar-email/', views.validar_email, name='validar_email'),
    path('validar-codigo/', views.validar_codigo_email, name='validar_codigo_email'),
    path('checar-sessao/', views.checar_sessao_cliente, name='checar_sessao_cliente'),
    path('encerrar-sessao/', views.encerrar_sessao, name='encerrar_sessao'),
]
