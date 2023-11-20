from numflow.kernels import dataset_kernel

class Dataset: 
        """
        A class representing a dataset.
        """

        def __init__(self, file_name: str):
            """
            Initializes a Dataset object.

            Args:
                file_name (str): The name of the CSV file containing the dataset.

            Raises:
                ValueError: If the dataset does not meet the required format.

            Dataset Format:
                - The dataset must be in CSV format.
                - The CSV file must not have a header.
                - The CSV file must have 6 columns, each containing a number.
                - The first three columns represent the coordinates of a point.
                - The last three columns represent the field velocity at that point.

            Rectilinear Grid:
                In a rectilinear grid, the points are arranged in a pattern where the grid 
                lines are straight and parallel to the coordinate axes. It's important to 
                note that the rectilinear grid does not have to be regular in terms of the 
                distances between the points. The grid can have varying intervals between 
                the points along each axis, allowing for flexibility in representing complex 
                spatial data. Here's a 2D ASCII illustration of a rectilinear grid:
                    
                  y 
                  ^ 
                 10 +---+---+---+---+
                    |   |   |   |   |
                  0 +---+---+---+---+
                    |   |   |   |   |
                -10 +---+---+---+---+
                    |   |   |   |   |
                -20 +---+---+---+---+
                    0   1   2   3   4  >x

                In a 3D rectilinear grid, the points are arranged in a cuboid pattern, similar to the 2D illustration.

            Example CSV Contents:
                0.0,0.0,0.0,1.0,2.0,3.0
                1.0,0.0,0.0,4.0,5.0,6.0
                2.0,0.0,0.0,7.0,8.0,9.0
                ...
            """
            self.file_name = file_name
            self.data = dataset_kernel(file_name)

        def info(self):
            """
            Returns a string containing information about the dataset.

            Returns:
                str: A string containing information about the dataset.
            """
            return f"Dataset: {self.file_name}\n" + self.data.info()