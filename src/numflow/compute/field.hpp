#pragma once
#include "types.hpp"

using namespace std;

class RectilinearField3D
{
public:
    RectilinearField3D(const string &filename);

    // coordinates, formerly  *ax, *ay, *az;
    vector<tfloat> x_coords, y_coords, z_coords;

    // axis sizes
    int32_t dx, dy, dz;

    // in field, z is the fastest changing coordinate
    // formerly *data;
    vector<tfloat> velocities;

protected:
    bool prepare_coord_field(vector<pair<tvec3, tvec3>> &pos_val);
};
