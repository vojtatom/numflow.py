from django.contrib import admin
from .models import Profile, Dataset, Notebook

admin.site.register(Profile)
admin.site.register(Dataset)
admin.site.register(Notebook)
