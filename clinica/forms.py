from django import forms
from .models import Agendamento

class AgendamentoForm(forms.ModelForm):
    class Meta:
        model = Agendamento
        fields = ['nome', 'email', 'telefone', 'tratamento', 'data', 'horario', 'observacoes']
        widgets = {
            'nome': forms.TextInput(attrs={
                'class': 'form-input', 
                'placeholder': 'Seu nome completo'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-input', 
                'placeholder': 'seu@email.com'
            }),
            'telefone': forms.TextInput(attrs={
                'class': 'form-input', 
                'placeholder': '(00) 00000-0000'
            }),
            'tratamento': forms.Select(attrs={
                'class': 'form-select'
            }),
            'data': forms.DateInput(attrs={
                'class': 'form-input', 
                'type': 'date'
            }),
            'horario': forms.TimeInput(attrs={
                'class': 'form-input', 
                'type': 'time'
            }),
            'observacoes': forms.Textarea(attrs={
                'class': 'form-textarea', 
                'rows': 3, 
                'placeholder': 'Alguma condição médica ou preferência?'
            }),
        }