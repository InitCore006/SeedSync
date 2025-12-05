import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User
User.objects.filter(phone_number__in=['+919137966960', '+918888888888']).delete()
print("Test users cleaned up. Ready for manual createsuperuser test.")
