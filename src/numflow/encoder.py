import json 
import numpy as np


class CustomJSONEncoder(json.JSONEncoder):
    # Override default() method
    def default(self, obj):
        if isinstance(obj, np.float32):
            return float(obj)
        # Default behavior for all other types
        return super().default(obj)