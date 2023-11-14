#pragma once
#include "types.hpp"
#include "field.hpp"

using namespace std;

struct DataStreamlines
{
    // positions
    vector<tfloat> y;
    // values
    vector<tfloat> f;
    // times
    vector<tfloat> t;
    // lengths
    vector<int32_t> l;
};

// integration
shared_ptr<DataStreamlines> integrate_3d(const shared_ptr<RectilinearField3D> dataset, const vector<tfloat> &points,
                                         const tfloat t0, const tfloat tbound);