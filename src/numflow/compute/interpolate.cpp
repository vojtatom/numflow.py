#include "interpolate.hpp"
#include <cmath>
#include <cstring>

struct marker
{
    int32_t i;
    tfloat fac;
    int32_t status;
};

/**
 * Finds the index of a value in a given grid and returns it along with a factor and status.
 *
 * @param value The value to find the index for.
 * @param grid The grid to search for the value along a single axis.
 * @param mark A marker struct to store the index, factor, and status.
 *
 * @return void
 *
 * @details This function performs a search for the index of a given value in a grid. It returns the index, a factor, and a status code in a marker struct. The factor is the distance between the value and the lower index divided by the distance between the lower and upper indices. The status code indicates whether the value was found in the grid or not. If the value is out of range, the status code is LookUp::outOfRange. If the value is within the range of the grid, the status code is LookUp::ok. If the grid is empty, the function returns without modifying the marker struct.
 */
void index(const tfloat value, const vector<tfloat> &grid, marker &mark)
{
    if (grid.size() == 0)
        return;

    int32_t low = 0;
    int32_t high = grid.size() - 1;
    tfloat min = grid[low];
    tfloat max = grid[high];
    int32_t middle = high * (value - min) / (max - min);

    if (value < min || value > max)
    {
        mark.status = LookUp::outOfRange;
        return;
    }

    if (high == low)
    {
        mark.status = LookUp::ok;
        mark.i = 0, mark.fac = 0;
        return;
    }

    // try to predict the index on uniform
    if (value >= grid[middle] && value <= grid[middle + 1])
        low = middle, high = middle + 1;
    else
    {
        // if not guessed, perform binary search
        // has to have more than one layer!!
        middle = (high - low) / 2;
        while (high - low != 1)
        {
            if (value < grid[middle])
                high = middle;
            else
                low = middle;
            middle = low + (high - low) / 2;
        }
    }

    mark.i = low;
    mark.fac = (value - grid[low]) / (grid[high] - grid[low]);
    mark.status = LookUp::ok;
}

/**
 * Interpolates a 3D dataset at given points using trilinear interpolation.
 *
 * @param dataset A shared pointer to a RectilinearField3D object containing the dataset to interpolate.
 * @param points A vector of tfloats containing the points to interpolate at. The vector must have a length that is a multiple of 3, with each set of 3 values representing the x, y, and z coordinates of a single point.
 *
 * @return A vector of tfloats containing the interpolated values at each point. The vector has the same length as the input points vector.
 *
 * @details This function performs trilinear interpolation on a 3D dataset at given points. The dataset is represented by a RectilinearField3D object, which contains arrays of x, y, and z coordinates, as well as an array of velocity values. The function first finds the indices of the grid points surrounding each input point using the index() function. It then performs trilinear interpolation on the velocity values at these grid points to obtain the interpolated value at the input point. If an input point is out of range of the dataset, or if any of the indices cannot be found, the function skips that point and moves on to the next one. The function returns a vector of interpolated values, with each value corresponding to the input point at the same index in the input points vector.
 */
void interpolate_3d_core(const shared_ptr<RectilinearField3D> dataset, const vector<tfloat> &points, tfloat *values)
{
    const size_t count = points.size() / 3;

    int32_t zy = dataset->dy * dataset->dz;
    int32_t zyx0, zyx1, zy0, zy1, zy0ind2, zy1ind2;
    tfloat c00[3], c01[3], c10[3], c11[3], c0[3], c1[3];
    marker x, y, z;

    // fill with zeros
    memset(values, 0, count * 3 * sizeof(tfloat));

    for (int32_t j = 0; j < count; j++)
    {
        // get indicies
        index(points[j * 3], dataset->x_coords, x);
        if (x.status != LookUp::ok)
            continue;
        index(points[j * 3 + 1], dataset->y_coords, y);
        if (y.status != LookUp::ok)
            continue;
        index(points[j * 3 + 2], dataset->z_coords, z);
        if (z.status != LookUp::ok)
            continue;

        // interpolate values
        zyx0 = zy * x.i * 3;
        zyx1 = zy * (x.i + 1) * 3;
        zy0 = dataset->dz * y.i * 3;
        zy1 = dataset->dz * (y.i + 1) * 3;
        zy0ind2 = zy0 + z.i * 3;
        zy1ind2 = zy1 + z.i * 3;

        for (int32_t i = 0; i < 3; ++i)
        {
            c00[i] = dataset->velocities[zyx0 + zy0ind2 + i] * (1.0 - x.fac) +
                     dataset->velocities[zyx1 + zy0ind2 + i] * x.fac;
            c01[i] = dataset->velocities[zyx0 + zy0ind2 + 3 + i] * (1.0 - x.fac) +
                     dataset->velocities[zyx1 + zy0ind2 + 3 + i] * x.fac;
            c10[i] = dataset->velocities[zyx0 + zy1ind2 + i] * (1.0 - x.fac) +
                     dataset->velocities[zyx1 + zy1ind2 + i] * x.fac;
            c11[i] = dataset->velocities[zyx0 + zy1ind2 + 3 + i] * (1.0 - x.fac) +
                     dataset->velocities[zyx1 + zy1ind2 + 3 + i] * x.fac;

            c0[i] = c00[i] * (1.0 - y.fac) + c10[i] * y.fac;
            c1[i] = c01[i] * (1.0 - y.fac) + c11[i] * y.fac;

            values[j * 3 + i] = c0[i] * (1.0 - z.fac) + c1[i] * z.fac;

            // NaN protection
            if (isnan(values[j * 3 + i]))
                values[j * 3 + i] = 0;

            // cout << values[j * 3 + i] << " " << flush;
        }

        // cout << endl;
    }
}

py::array_t<tfloat> interpolate_3d(
    const shared_ptr<RectilinearField3D> dataset,
    const py::array_t<tfloat, py::array::c_style | py::array::forcecast> &points)
{
    py::buffer_info info = points.request();
    if (info.ndim != 2)
        throw std::runtime_error("Number of array dimensions passed to interpolate_3d must be 2");
    if (info.shape[1] != 3)
        throw std::runtime_error("Second dimension of array passed to interpolate_3dmust be 3");

    // the data is passed as pointer so the vector does not own it
    vector<tfloat> raw_points = vector<tfloat>((tfloat *)info.ptr, (tfloat *)info.ptr + info.shape[0] * info.shape[1]);

    size_t size = raw_points.size();
    tfloat *values = new tfloat[size];
    interpolate_3d_core(dataset, raw_points, values);

    // Create a numpy array that takes ownership of the data
    py::capsule free_when_done(values, [](void *f)
                               { delete[] reinterpret_cast<tfloat *>(f); });

    return py::array_t<tfloat>(
        {(size_t)(size / 3), (size_t)3},      // shape of the array
        {3 * sizeof(tfloat), sizeof(tfloat)}, // C-style contiguous strides for double
        values,                               // the data pointer
        free_when_done);                      // the capsule
}

/**
 * Interpolates a 3D dataset at a single point using trilinear interpolation.
 *
 * @param dataset A shared pointer to a RectilinearField3D object containing the dataset to interpolate.
 * @param points An array of tfloats containing the x, y, and z coordinates of the point to interpolate at.
 * @param out_values An array of tfloats to store the interpolated values at the input point.
 *
 * @return void
 *
 * @details This function performs trilinear interpolation on a 3D dataset at a single point. The dataset is represented by a RectilinearField3D object, which contains arrays of x, y, and z coordinates, as well as an array of velocity values. The function first finds the indices of the grid points surrounding the input point using the index() function. It then performs trilinear interpolation on the velocity values at these grid points to obtain the interpolated value at the input point. If the input point is out of range of the dataset, or if any of the indices cannot be found, the function returns without modifying the out_values array.
 */
void interpolate_3d_single_point(const shared_ptr<RectilinearField3D> dataset, const tfloat points[3], tfloat out_values[3])
{

    int32_t zy = dataset->dy * dataset->dz;
    int32_t zyx0, zyx1, zy0, zy1, zy0ind2, zy1ind2;
    tfloat c00[3], c01[3], c10[3], c11[3], c0[3], c1[3];
    marker x, y, z;

    // fill with zeros
    memset(out_values, 0, 3 * sizeof(tfloat));

    // get indicies
    index(points[0], dataset->x_coords, x);
    if (x.status != LookUp::ok)
        return;
    index(points[1], dataset->y_coords, y);
    if (y.status != LookUp::ok)
        return;
    index(points[2], dataset->z_coords, z);
    if (z.status != LookUp::ok)
        return;

    // interpolate values
    zyx0 = zy * x.i * 3;
    zyx1 = zy * (x.i + 1) * 3;
    zy0 = dataset->dz * y.i * 3;
    zy1 = dataset->dz * (y.i + 1) * 3;
    zy0ind2 = zy0 + z.i * 3;
    zy1ind2 = zy1 + z.i * 3;

    for (int32_t i = 0; i < 3; ++i)
    {
        c00[i] = dataset->velocities[zyx0 + zy0ind2 + i] * (1.0 - x.fac) +
                 dataset->velocities[zyx1 + zy0ind2 + i] * x.fac;
        c01[i] = dataset->velocities[zyx0 + zy0ind2 + 3 + i] * (1.0 - x.fac) +
                 dataset->velocities[zyx1 + zy0ind2 + 3 + i] * x.fac;
        c10[i] = dataset->velocities[zyx0 + zy1ind2 + i] * (1.0 - x.fac) +
                 dataset->velocities[zyx1 + zy1ind2 + i] * x.fac;
        c11[i] = dataset->velocities[zyx0 + zy1ind2 + 3 + i] * (1.0 - x.fac) +
                 dataset->velocities[zyx1 + zy1ind2 + 3 + i] * x.fac;

        c0[i] = c00[i] * (1.0 - y.fac) + c10[i] * y.fac;
        c1[i] = c01[i] * (1.0 - y.fac) + c11[i] * y.fac;

        out_values[i] = c0[i] * (1.0 - z.fac) + c1[i] * z.fac;

        // NaN protection
        if (isnan(out_values[i]))
            out_values[i] = 0;
    }

    // cout << "    interp " << points[0] << " " << points[1] << " " << points[2] << endl;
    // cout << "           " << values[0] << " " << values[1] << " " << values[2] << endl;
}
