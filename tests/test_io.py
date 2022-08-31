from numflow import load_field


def test_load(rectilinear_csv_data: str):
    field = load_field(rectilinear_csv_data)
    print(field.data)
    assert field != None