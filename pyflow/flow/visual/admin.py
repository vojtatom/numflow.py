from django.contrib import admin
from .models import Profile, Dataset, Notebook, Task

admin.site.register(Profile)
admin.site.register(Dataset)
admin.site.register(Notebook)
admin.site.register(Task)
