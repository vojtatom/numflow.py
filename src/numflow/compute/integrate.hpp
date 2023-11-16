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

    py::memoryview get_y()
    {
        return py::memoryview::from_buffer(
            y.data(),
            {y.size()},
            {sizeof(tfloat)});
    };

    py::memoryview get_f()
    {
        return py::memoryview::from_buffer(
            f.data(),
            {f.size()},
            {sizeof(tfloat)});
    };

    py::memoryview get_t()
    {
        return py::memoryview::from_buffer(
            t.data(),
            {t.size()},
            {sizeof(tfloat)});
    };

    py::memoryview get_l()
    {
        return py::memoryview::from_buffer(
            l.data(),
            {l.size()},
            {sizeof(int32_t)});
    };

};

// integration
shared_ptr<DataStreamlines> integrate_3d(
    const shared_ptr<RectilinearField3D> dataset,
    const py::array_t<tfloat, py::array::c_style | py::array::forcecast> &points,
    const tfloat t0,
    const tfloat tbound);