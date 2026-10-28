from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
from .models import Categoria, Tratamento
from .forms import AgendamentoForm
from django.db.models import Q, Count

def home(request):
   categorias = Categoria.objects.annotate(
      total_ativos=Count('tratamentos', filter=Q(tratamentos__ativo=True))
   ).filter(total_ativos__gt=0)
   tratamentos = Tratamento.objects.filter(ativo=True).select_related('categoria')
   form = AgendamentoForm()

   if request.method == 'POST':
      form = AgendamentoForm(request.POST)
      if form.is_valid():
         form.save()
         messages.success(request, 'Agendamento solicitado com sucesso! Entraremos em contato.')
         return redirect('home')
      else:
         if request.headers.get('x-requested-with') == 'XMLHttpRequest':
               return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)

   context = {
      'categorias': categorias,
      'tratamentos': tratamentos,
      'form': form,
   }

   return render(request, 'home.html', context)
