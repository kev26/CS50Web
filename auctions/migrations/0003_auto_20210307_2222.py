# Generated by Django 3.1.4 on 2021-03-07 15:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0002_auto_20210306_1136'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='item',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='auctions.listing'),
        ),
    ]