import json
import os
import uuid
import base64

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.files.base import ContentFile


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(null=True, blank=True)

    objects = models.Manager()


@receiver(post_save, sender=User)
def update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()

###########################################################################

def directory_path_dataset(instance, filename):
    """
    Create path for Dataset file
    """

    extension = filename.split('.')[1]
    return 'data/{}/raw.{}'.format(str(instance.code), extension)

class Dataset(models.Model):
    title = models.CharField(max_length=255)
    code = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    time_created = models.DateTimeField(auto_now_add=True)
    data = models.FileField(upload_to=directory_path_dataset, blank=False)
    status = models.IntegerField(default=0)
    owners = models.ManyToManyField(User, related_name="owners")
    description = models.TextField(blank=True)

    objects = models.Manager()



    def __str__(self):
        return "{} / {}".format(str(self.title), self.time_created)


@receiver(models.signals.post_delete, sender=Dataset)
def auto_delete_file_on_delete_dataset(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `Dataset` object is deleted.
    """

    if instance.data and os.path.isfile(instance.data.path):
        os.remove(instance.data.path)
        os.rmdir(os.path.dirname(instance.data.path))


###########################################################################

def directory_path_notebook(instance, filename):
    """
    Create path for Notebook output file
    """

    return 'notebook/{}/{}'.format(str(instance.code), filename)

class Notebook(models.Model):
    title = models.CharField(max_length=255, default="New Notebook")
    code = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    time_created = models.DateTimeField(auto_now_add=True)
    time_modified = models.DateTimeField(auto_now=True)
    data = models.TextField(blank=True)
    output = models.FileField(upload_to=directory_path_notebook, blank=True)
    nodefile = models.FileField(upload_to=directory_path_notebook, blank=True)
    authors = models.ManyToManyField(User, related_name="authors")

    objects = models.Manager()


    def save_output(self, contents):
        if self.output and os.path.isfile(self.output.path):
            with open(self.output.path, 'r') as f:
                old_data = f.read()
            contents = old_data[1:-1] + ',' + contents
        self.clear_output()

        #manually into json format...
        self.output.save('output.imgflow', ContentFile('[' + contents + ']'), save=True)

    def clear_output(self):
        if self.output and os.path.isfile(self.output.path):
            self.output.delete()

    def save_nodefile(self):
        self.clear_nodefile()
        #manually into json format...
        self.nodefile.save('data.docflow', ContentFile(self.data), save=True)

    def clear_nodefile(self):
        if self.nodefile and os.path.isfile(self.nodefile.path):
            self.nodefile.delete()

    def __str__(self):
        return self.title + ' ' + str(self.code)


@receiver(models.signals.post_delete, sender=Notebook)
def auto_delete_file_on_delete_notebook(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `Notebook` object is deleted.
    """

    if instance.output and os.path.isfile(instance.output.path):
        os.remove(instance.output.path)
        os.rmdir(os.path.dirname(instance.output.path))

    if instance.nodefile and os.path.isfile(instance.nodefile.path):
        os.remove(instance.nodefile.path)
        os.rmdir(os.path.dirname(instance.nodefile.path))
