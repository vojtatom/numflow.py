#pragma once
#include "types.hpp"

using namespace std;


class RectilinearField3D {
public:
    RectilinearField3D(const string & filename);
    vector<tfloat> get_data() const;

protected:
    bool prepare_coord_field(vector<pair<tvec3, tvec3>> & pos_val);

    tvec3 unit;
    vector<tfloat> x_coords;
    vector<tfloat> y_coords;
    vector<tfloat> z_coords;
    //in field, z is the fastest changing coordinate
    vector<vector<vector<tvec3>>> field;
};

