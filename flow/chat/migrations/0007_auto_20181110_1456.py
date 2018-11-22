# Generated by Django 2.1.2 on 2018-11-10 14:56

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0006_auto_20181110_1451'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='chatroom',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='chat.Chatroom'),
        ),
        migrations.AlterField(
            model_name='message',
            name='sender',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]