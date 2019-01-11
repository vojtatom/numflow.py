

class Data:
    mode = 'scipy'

    def __init__(self, data, minimum, maximum):
        self.data = data
        self.minimum = minimum
        self.maximum = maximum

    @property
    def grid_min(self): 
        return self.minimum

    @property
    def grid_max(self):
        return self.maximum