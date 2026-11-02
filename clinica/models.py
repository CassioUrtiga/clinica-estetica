from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_delete
from django.dispatch import receiver

class Categoria(models.Model):
    nome = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'

    def __str__(self):
        return self.nome

class Tratamento(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='tratamentos')
    titulo = models.CharField(max_length=100)
    descricao = models.TextField()
    preco = models.DecimalField(max_digits=10, decimal_places=2, help_text="Preço base para a calculadora")
    duracao = models.CharField(max_length=50, help_text="Ex: 60 min")
    imagem = models.ImageField(upload_to='tratamentos/', blank=True, null=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Tratamento'
        verbose_name_plural = 'Tratamentos'

    def __str__(self):
        return self.titulo

class Agendamento(models.Model):
    STATUS_CHOICES = (
        ('pendente', 'Pendente'),
        ('confirmado', 'Confirmado'),
        ('cancelado', 'Cancelado'),
        ('concluido', 'Concluído'),
    )

    nome = models.CharField(max_length=100)
    email = models.EmailField()
    telefone = models.CharField(max_length=20)
    tratamento = models.ForeignKey(Tratamento, on_delete=models.SET_NULL, null=True)
    data = models.DateField()
    horario = models.TimeField()
    observacoes = models.TextField(blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    avaliacao = models.SmallIntegerField(
        default=0,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(5)
        ]
    )

    class Meta:
        verbose_name = 'Agendamento'
        verbose_name_plural = 'Agendamentos'
        ordering = ['-criado_em']

    def __str__(self):
        return f"{self.nome} - {self.tratamento} ({self.data})"

class RelatorioAgendamento(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField()
    telefone = models.CharField(max_length=20)
    tratamento_nome = models.CharField(max_length=100, blank=True, null=True)
    data = models.DateField()
    horario = models.TimeField()
    status_final = models.CharField(max_length=20)
    avaliacao = models.SmallIntegerField(default=0)
    deletado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Relatório de Agendamento'
        verbose_name_plural = 'Relatórios de Agendamentos'
        ordering = ['-deletado_em']

    def __str__(self):
        return f"Histórico: {self.nome} - {self.data}"


# Sinal acionado automaticamente ANTES/DEPOIS de deletar um Agendamento
@receiver(post_delete, sender=Agendamento)
def salvar_historico_agendamento(sender, instance, **kwargs):
    RelatorioAgendamento.objects.create(
        nome=instance.nome,
        email=instance.email,
        telefone=instance.telefone,
        tratamento_nome=instance.tratamento.titulo if instance.tratamento else "Tratamento Removido",
        data=instance.data,
        horario=instance.horario,
        status_final=instance.get_status_display(),
        avaliacao=instance.avaliacao
    )
