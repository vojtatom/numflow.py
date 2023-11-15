from numflow import load_field


def test_load_rectilinear(rectilinear_csv_data: str):
    field = load_field(rectilinear_csv_data)
    print(field.velocities)
    assert field != None
    
    
def test_load_sun(sun_csv_data: str):
    field = load_field(sun_csv_data)
    print(field.x_coords)
    assert field != None