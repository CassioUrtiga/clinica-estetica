import openpyxl
from django.contrib import admin
from django.http import HttpResponse
from .models import Categoria, Tratamento, Agendamento, RelatorioAgendamento

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

@admin.action(description="Exportar selecionados para Excel (.xlsx)")
def exportar_para_excel(modeladmin, request, queryset):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Relatório"

    # Define o cabeçalho
    headers = [
        'ID', 'Nome Cliente', 'E-mail', 'Telefone', 
        'Tratamento', 'Data Tratamento', 'Horário Tratamento', 'Status Final', 
        'Avaliação', 'Data da Exclusão'
    ]
    ws.append(headers)

    # Preenche com as linhas selecionadas no Admin
    for obj in queryset:
        ws.append([
            obj.id,
            obj.nome,
            obj.email,
            obj.telefone,
            obj.tratamento_nome,
            obj.data.strftime('%d/%m/%Y') if obj.data else '',
            obj.horario.strftime('%H:%M') if obj.horario else '',
            obj.status_final,
            obj.avaliacao,
            obj.deletado_em.strftime('%d/%m/%Y %H:%M') if obj.deletado_em else ''
        ])

    # Configura a resposta HTTP para download de arquivo Excel
    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename="relatorio_agendamentos.xlsx"'
    wb.save(response)
    
    return response

@admin.register(RelatorioAgendamento)
class RelatorioAgendamentoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'email', 'tratamento_nome', 'preco', 'data', 'status_final', 'deletado_em')
    list_filter = ('data', 'deletado_em', 'status_final')
    search_fields = ('nome', 'email', 'telefone', 'tratamento_nome')
    readonly_fields = [f.name for f in RelatorioAgendamento._meta.fields]
    
    # Adiciona a ação de exportar no menu de ações em lote
    actions = [exportar_para_excel]

    # Impede a criação manual de relatórios pelo painel (pois são criados via exclusão automática)
    def has_add_permission(self, request):
        return False
