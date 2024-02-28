from django.db import models

class usertest(models.Model):
	login = models.TextField()
	first_name = models.TextField()
	last_name = models.TextField()
	image = models.TextField()
