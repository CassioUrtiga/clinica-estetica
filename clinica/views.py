import random
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages
from django.http import JsonResponse
from .forms import AgendamentoForm
from .models import Categoria, Tratamento, Agendamento


def home(request):
   categorias = Categoria.objects.all()
   tratamentos = Tratamento.objects.all()

   if request.method == 'POST':
      data = request.POST.copy()
      
      cliente_email_sessao = request.session.get('cliente_autenticado_email')
      
      if cliente_email_sessao:
         # O e-mail enviado no form seja o mesmo e-mail validado na sessão
         data['email'] = cliente_email_sessao

      form = AgendamentoForm(data)

      if form.is_valid():
         data_agendamento = form.cleaned_data.get('data')
         horario_agendamento = form.cleaned_data.get('horario')

         # Validação 1: Verifica conflito de horário (Se já existe agendamento ativo nesse dia/horário)
         conflito_horario = Agendamento.objects.filter(
            data=data_agendamento,
            horario=horario_agendamento
         ).exclude(status='cancelado').exists()

         if conflito_horario:
            messages.error(request, 'Este horário já está ocupado. Por favor, escolha outro horário ou data.')
            return redirect('home')

         # Salva o agendamento
         agendamento = form.save()
         
         # Mantém/Atualiza o e-mail na sessão para permitir novos agendamentos sem pedir código novamente
         request.session['cliente_autenticado_email'] = agendamento.email

         messages.success(request, 'Agendamento solicitado com sucesso! Entraremos em contato.')
         return redirect('home')
      else:
         messages.error(request, 'Ocorreu um erro! Campos inválidos ou incompletos.')
         return redirect('home')
   else:
      # Inicializa o formulário com o e-mail autenticado (se existir na sessão)
      cliente_email_sessao = request.session.get('cliente_autenticado_email')
      initial_data = {}
      
      if cliente_email_sessao:
         initial_data['email'] = cliente_email_sessao
         # Tenta buscar o último agendamento para preencher nome e telefone
         ultimo_agendamento = Agendamento.objects.filter(email__iexact=cliente_email_sessao).first()
         if ultimo_agendamento:
            initial_data['nome'] = ultimo_agendamento.nome
            initial_data['telefone'] = ultimo_agendamento.telefone

      form = AgendamentoForm(initial=initial_data)

   context = {
      'categorias': categorias,
      'tratamentos': tratamentos,
      'form': form,
      'sessao': bool(request.session.get('cliente_autenticado_email'))
   }

   return render(request, 'home.html', context)

def validar_email(request):
   if request.method == 'POST':
      email = request.POST.get('emailConta', '').strip()
      
      user_exists = Agendamento.objects.filter(email__iexact=email).exists()
      
      if user_exists:
         # Gera código numérico aleatório de 5 dígitos
         codigo = str(random.randint(10000, 99999))

         # Salva o código e o e-mail na Sessão
         request.session['auth_email'] = email
         request.session['auth_code'] = codigo

         # Envia o e-mail
         try:
            send_mail(
               subject='Seu Código de Acesso',
               message=f'Seu código de acesso para a clínica é: {codigo}',
               from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@aura.com'),
               recipient_list=[email],
               fail_silently=False,
            )
            return JsonResponse({'success': True})
         except Exception as e:
            return JsonResponse({
               'success': False, 
               'message': 'Erro ao enviar o e-mail.'
            }, status=500)
      else:
         return JsonResponse({
            'success': False, 
            'message': 'E-mail não encontrado.'
         }, status=404)
           
   return JsonResponse({
      'success': False, 
      'message': 'Método inválido.'
   }, status=400)

def validar_codigo_email(request):
   if request.method == 'POST':
      codigo_digitado = request.POST.get('codigo', '').strip()
      
      email_sessao = request.session.get('auth_email')
      codigo_sessao = request.session.get('auth_code')
      
      if not email_sessao or not codigo_sessao:
         return JsonResponse({
            'success': False, 
            'message': 'Sessão expirada. Solicite o código novamente.'
         }, status=400)
         
      if codigo_digitado == codigo_sessao:
         agendamentos = Agendamento.objects.filter(
               email__iexact=email_sessao
         ).select_related('tratamento').order_by('-data', '-horario')
         
         request.session['cliente_autenticado_email'] = email_sessao
         
         lista_agendamentos = []
         for ag in agendamentos:
            data_str = ag.data.strftime('%d/%m/%Y') if ag.data else ''
            horario_str = ag.horario.strftime('%H:%M') if ag.horario else ''
            data_hora_formatada = f"{data_str} às {horario_str}".strip(" às")
            
            if ag.tratamento:
               nome_tratamento = ag.tratamento.titulo
               preco_val = float(ag.tratamento.preco)
            else:
               nome_tratamento = 'Tratamento não informado'
               preco_val = 0.0
            
            preco_str = f"R$ {preco_val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

            lista_agendamentos.append({
               'id': ag.id,
               'cliente_nome': ag.nome,
               'telefone': ag.telefone,
               'status': ag.status,
               'tratamento': nome_tratamento,
               'data_hora': data_hora_formatada,
               'observacoes': ag.observacoes or '',
               'preco': preco_str
            })
         
         # Limpa os dados de validação da sessão
         request.session.pop('auth_code', None)
         request.session.pop('auth_email', None)
         
         return JsonResponse({
            'success': True,
            'data': {'agendamentos': lista_agendamentos}
         })
      else:
         return JsonResponse({
            'success': False, 
            'message': 'Código incorreto.'
         }, status=400)
         
   return JsonResponse({
      'success': False, 
      'message': 'Método inválido.'
   }, status=400)


def checar_sessao_cliente(request):
   email_sessao = request.session.get('cliente_autenticado_email')
    
   if not email_sessao:
      return JsonResponse({'autenticado': False})

   agendamentos = Agendamento.objects.filter(
      email__iexact=email_sessao
   ).select_related('tratamento').order_by('-data', '-horario')

   lista_agendamentos = []

   for ag in agendamentos:
      data_str = ag.data.strftime('%d/%m/%Y') if ag.data else ''
      horario_str = ag.horario.strftime('%H:%M') if ag.horario else ''
      data_hora_formatada = f"{data_str} às {horario_str}".strip(" às")
      
      if ag.tratamento:
         nome_tratamento = ag.tratamento.titulo
         preco_val = float(ag.tratamento.preco)
      else:
         nome_tratamento = 'Tratamento não informado'
         preco_val = 0.0
      
      preco_str = f"R$ {preco_val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

      lista_agendamentos.append({
         'id': ag.id,
         'cliente_nome': ag.nome,
         'telefone': ag.telefone,
         'status': ag.status,
         'tratamento': nome_tratamento,
         'data_hora': data_hora_formatada,
         'observacoes': ag.observacoes or '',
         'preco': preco_str
      })

   return JsonResponse({
      'autenticado': True,
      'email': email_sessao,
      'agendamentos': lista_agendamentos
   })

def encerrar_sessao(request):
   request.session.pop('cliente_autenticado_email', None)

   return redirect('home')
    