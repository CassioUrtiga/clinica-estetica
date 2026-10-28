from django.contrib import admin
from .models import Categoria, Tratamento, Agendamento

# Configuração do Cabeçalho e Títulos do Admin
admin.site.site_header = "Gestão da Clínica"
admin.site.site_title = "Estética Administração"
admin.site.index_title = "Painel de Controle"


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'slug')
    prepopulated_fields = {'slug': ('nome',)}

@admin.register(Tratamento)
class TratamentoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'categoria', 'preco', 'duracao', 'ativo')
    list_filter = ('categoria', 'ativo')
    search_fields = ('titulo', 'descricao')

@admin.register(Agendamento)
class AgendamentoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tratamento', 'data', 'horario', 'telefone', 'status')
    list_filter = ('status', 'data')
    search_fields = ('nome', 'email', 'telefone')
