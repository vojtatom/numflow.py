import os

import django
from channels.routing import get_default_application

os.environ.setdefault("DJAGO_SETTING_MODULE", "flow.settings")
django.setup()
application = get_default_application()
