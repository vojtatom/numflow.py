#include <algorithm>
#include <iostream>
#include <fstream>
#include <locale>
#include <cassert>
#include <sstream>
#include <string>
#include <cmath>

#include "numflow.hpp"
#include "buffer.hpp"

using namespace std;

//-----------------------------------------------------------------------------------

struct dataset_line3D
{
    float x, y, z;
    float vx, vy, vz;
};

struct dataset_line2D
{
    float x, y;
    float vx, vy;
};

struct marker
{
    int32_t i;
    float fac;
    int32_t status;
};

enum LookUp
{
    ok,
    outOfRange,
};

//Matrices for 4th order RK step
const float A[25] = {1.0 / 5.0, 0.0, 0.0, 0.0, 0.0,
                      3.0 / 40.0, 9.0 / 40.0, 0.0, 0.0, 0.0,
                      44.0 / 45.0, -(56.0 / 15.0), 32.0 / 9.0, 0.0, 0.0,
                      19372.0 / 6561.0, -(25360.0 / 2187.0), 64448.0 / 6561.0, -(212.0 / 729.0), 0.0,
                      9017.0 / 3168.0, -(355.0 / 33.0), 46732.0 / 5247.0, 49.0 / 176.0, -(5103.0 / 18656.0)};

const float B[6] = {35.0 / 384.0, 0.0, 500.0 / 1113.0, 125.0 / 192.0, -(2187.0 / 6784.0), 11.0 / 84.0};
const float C[5] = {1.0 / 5.0, 3.0 / 10.0, 4.0 / 5.0, 8.0 / 9.0, 1.0};
const float E[7] = {-(71.0 / 57600.0), 0.0, 71.0 / 16695.0, -(71.0 / 1920.0), 17253.0 / 339200.0, -(22.0 / 525.0), 1.0 / 40.0};

//Constants
const float SAFETY = 0.9;     // Multiply steps computed from asymptotic behaviour of errors by this.
const float MIN_FACTOR = 0.2; // Minimum allowed decrease in a step size.
const float MAX_FACTOR = 10;  // Maximum allowed increase in a step size.

//-----------------------------------------------------------------------------------

void index(const float value, const float *grid, const int32_t size, marker &mark)
{
    if (size == 0)
        return;

    int32_t low = 0;
    int32_t high = size - 1;
    float min = grid[low];
    float max = grid[high];
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

float *interpolate_3d(const Dataset3D *dataset, const float *points, const int32_t count)
{
    float *values = new float[count * 3]{};

    int32_t zy = dataset->dy * dataset->dz;
    int32_t zyx0, zyx1, zy0, zy1, zy0ind2, zy1ind2;
    float c00[3], c01[3], c10[3], c11[3], c0[3], c1[3];
    marker x, y, z;

    for (int32_t j = 0; j < count; j++)
    {
        //get indicies
        index(points[j * 3], dataset->ax, dataset->dx, x);
        if (x.status != LookUp::ok)
            continue;
        index(points[j * 3 + 1], dataset->ay, dataset->dy, y);
        if (y.status != LookUp::ok)
            continue;
        index(points[j * 3 + 2], dataset->az, dataset->dz, z);
        if (z.status != LookUp::ok)
            continue;

        //interpolate values
        zyx0 = zy * x.i * 3;
        zyx1 = zy * (x.i + 1) * 3;
        zy0 = dataset->dz * y.i * 3;
        zy1 = dataset->dz * (y.i + 1) * 3;
        zy0ind2 = zy0 + z.i * 3;
        zy1ind2 = zy1 + z.i * 3;

        for (int32_t i = 0; i < 3; ++i)
        {
            c00[i] = dataset->data[zyx0 + zy0ind2 + i] * (1.0 - x.fac) +
                     dataset->data[zyx1 + zy0ind2 + i] * x.fac;
            c01[i] = dataset->data[zyx0 + zy0ind2 + 3 + i] * (1.0 - x.fac) +
                     dataset->data[zyx1 + zy0ind2 + 3 + i] * x.fac;
            c10[i] = dataset->data[zyx0 + zy1ind2 + i] * (1.0 - x.fac) +
                     dataset->data[zyx1 + zy1ind2 + i] * x.fac;
            c11[i] = dataset->data[zyx0 + zy1ind2 + 3 + i] * (1.0 - x.fac) +
                     dataset->data[zyx1 + zy1ind2 + 3 + i] * x.fac;

            c0[i] = c00[i] * (1.0 - y.fac) + c10[i] * y.fac;
            c1[i] = c01[i] * (1.0 - y.fac) + c11[i] * y.fac;

            values[j * 3 + i] = c0[i] * (1.0 - z.fac) + c1[i] * z.fac;
        }
    }

    return values;
}

//copy of the method above for single point use
void interpolate_3d(const Dataset3D *dataset, const float *points, float *values)
{
    int32_t zy = dataset->dy * dataset->dz;
    int32_t zyx0, zyx1, zy0, zy1, zy0ind2, zy1ind2;
    float c00[3], c01[3], c10[3], c11[3], c0[3], c1[3];
    marker x, y, z;

    //get indicies
    index(points[0], dataset->ax, dataset->dx, x);
    if (x.status != LookUp::ok)
        return;
    index(points[1], dataset->ay, dataset->dy, y);
    if (y.status != LookUp::ok)
        return;
    index(points[2], dataset->az, dataset->dz, z);
    if (z.status != LookUp::ok)
        return;

    //interpolate values
    zyx0 = zy * x.i * 3;
    zyx1 = zy * (x.i + 1) * 3;
    zy0 = dataset->dz * y.i * 3;
    zy1 = dataset->dz * (y.i + 1) * 3;
    zy0ind2 = zy0 + z.i * 3;
    zy1ind2 = zy1 + z.i * 3;

    for (int32_t i = 0; i < 3; ++i)
    {
        c00[i] = dataset->data[zyx0 + zy0ind2 + i] * (1.0 - x.fac) +
                 dataset->data[zyx1 + zy0ind2 + i] * x.fac;
        c01[i] = dataset->data[zyx0 + zy0ind2 + 3 + i] * (1.0 - x.fac) +
                 dataset->data[zyx1 + zy0ind2 + 3 + i] * x.fac;
        c10[i] = dataset->data[zyx0 + zy1ind2 + i] * (1.0 - x.fac) +
                 dataset->data[zyx1 + zy1ind2 + i] * x.fac;
        c11[i] = dataset->data[zyx0 + zy1ind2 + 3 + i] * (1.0 - x.fac) +
                 dataset->data[zyx1 + zy1ind2 + 3 + i] * x.fac;

        c0[i] = c00[i] * (1.0 - y.fac) + c10[i] * y.fac;
        c1[i] = c01[i] * (1.0 - y.fac) + c11[i] * y.fac;

        values[i] = c0[i] * (1.0 - z.fac) + c1[i] * z.fac;
    }
}

//-------------------------------------------------------------------------------

float norm(float *val)
{
    return sqrt(val[0] * val[0] + val[1] * val[1] + val[2] * val[2]);
}

float dot(const float *vec_a, const float *vec_b, const int32_t vec_l, 
           const int32_t stride_a, const int32_t stride_b)
{
    float d = 0.0;
    for (int32_t i = 0; i < vec_l; ++i)
        d += vec_a[i * stride_a] * vec_b[i * stride_b];

    return d;
}

enum SolverStatus
{
    ready,
    finished,
    failed
};

struct RKSolver
{
    RKSolver(const Dataset3D *_dataset, float _t0, float _tbound, const size_t _dims)
        : dataset(_dataset), order(4), n_stages(6),
          atol(1e-6), rtol(1e-3), t0(_t0), tbound(_tbound),
          direction(tbound - t0 > 0 ? 1 : -1), dims(_dims), status(SolverStatus::ready){};

    //Initial step of integration, sets up internal variables
    //and selects initial step value. In case solver was used previously,
    //restarts time and status.
    void initial_step(const float *y0)
    {
        float d0, d1, d2, h0, h1;

        //restarting, just to make sure
        t = t0;
        status = SolverStatus::ready;

        // TODO - replace with time interpolation, value t0 (t)
        interpolate_3d(dataset, y0, f);

        for (size_t i = 0; i < dims; i++)
        {
            y[i] = y0[i];
            sc[i] = atol + abs(y[i]) * rtol;
            yt[i] = y[i] / sc[i];
            ft[i] = f[i] / sc[i];
        }

        d0 = norm(yt);
        d1 = norm(ft);

        if (d0 < 1e-5 || d1 < 1e-5)
            h0 = 1e-6;
        else
            h0 = 0.01 * (d0 / d1);

        for (size_t i = 0; i < dims; i++)
            y1[i] = y[i] + h0 * direction * f[i];

        // TODO - replace with time interpolation, value = t0 + h0 * direction
        interpolate_3d(dataset, y1, f1);

        for (size_t i = 0; i < dims; i++)
            ft[i] = (f1[i] * f[i]) / sc[i];

        d2 = norm(ft) / h0;

        if (d1 <= 1e-15 && d2 <= 1e-15)
            h1 = fmax(1e-6, h0 * 1e-3);
        else
            h1 = pow(0.01 / fmax(d1, d2), 1.0 / (order + 1));

        h_abs = fmin(100 * h0, h1);
    };

    //Perform one step. Updates internal values.
    void step()
    {
        //initial checks
        if (status == SolverStatus::finished || status == SolverStatus::failed)
            return;

        //declaring all necessary
        float t_new;
        float min_step = 10.0 * (nextafter(t, tbound) - t);
        float lh_abs = h_abs; // absolute dt
        float h = 0;          // actualy is dt
        int32_t accepted = 0;

        //if dt is smaller than minimal step
        //max_step is infinity so no need to check if h_abs is higher
        if (h_abs < min_step)
            lh_abs = min_step;

        while (!accepted)
        {
            if (lh_abs < min_step)
            {
                status = SolverStatus::failed;
                return;
            }

            //h is now real dt with accurate directin
            h = lh_abs * direction;
            t_new = t + h;

            //check for bounds and update h (dt)
            if ((t_new - tbound) * direction > 0)
                t_new = tbound;

            h = t_new - t;
            h_abs = fabs(h);

            //perform step, error is implemented inside
            rk_step(h);
            //y_new -> self.y1, f_new -> self.f1, err_nrm -> self.ern

            if (ern == 0.0)
            {
                h_abs *= MAX_FACTOR;
                accepted = 1;
            }
            else if (ern < 1)
            {
                h_abs *= fmin(MAX_FACTOR, fmax(1.0, SAFETY * pow(ern, -(1.0 / (order + 1.0)))));
                accepted = 1;
            }
            else
                h_abs *= fmax(MIN_FACTOR, SAFETY * pow(ern, -(1.0 / (order + 1.0))));
        }

        t = t_new;
        h_abs = h_abs;
        for (size_t i = 0; i < dims; i++)
            y[i] = y1[i], f[i] = f1[i];

        //check for finish
        if (direction * (t - tbound) >= 0)
            status = SolverStatus::finished;
    };

    //Low level implementation of single
    //Runge-Kutta step.
    //
    //Significant calculated values:
    //    this->y1  - new position (vector)
    //    this->f1  - new function value (vector)
    //    this->er  - error rate (vector)
    //    this->ern - norm from error rate (value)
    void rk_step(float h)
    {
        float tmp = 0.0;

        //prepare K matrix and init y1 (new_y)
        for (size_t i = 0; i < dims; i++)
        {
            K[0 * dims + i] = f[i];
            y1[i] = 0;
            er[i] = 0;
        }

        //5 as constant size of A and C
        for (size_t i = 0; i < 5; i++)
        {
            //for each component
            for (size_t c = 0; c < dims; c++)
            {
                // Dot product with transposed K,
                // transposition is done using strides
                tmp = dot(&A[i * 5], &K[c], i + 1, 1, dims);
                yt[c] = tmp * h + y[c];
            }
            //TODO - time interpolation, value = t + c[i] * h
            interpolate_3d(dataset, yt, &K[(i + 1) * dims]);
        }

        //dotproduct with B, adding the rest from above
        for (size_t c = 0; c < dims; c++)
            y1[c] = y[c] + h * dot(&K[c], B, 6, dims, 1);

        // TODO - time interpolation, value = t + h
        // f1 will be in K on 6th row
        interpolate_3d(dataset, y1, &K[6 * dims]);

        // calculate vector error
        for (size_t c = 0; c < dims; c++)
            er[c] = dot(&K[c], E, 7, dims, 1);

        for (size_t c = 0; c < dims; c++)
        {
            // scale error vector and copy f1 from K
            er[c] *= h;
            f1[c] = K[6 * dims + c];
            // scaling
            sc[c] = atol + fmax(fabs(y[c]), fabs(y1[c])) * rtol;
            er[c] = er[c] / sc[c];
        }

        // calculate norm of error
        ern = norm(er);
    };

    //const settings
    const Dataset3D *dataset;
    const size_t order;
    const size_t n_stages;
    const float atol;
    const float rtol;
    const float t0;
    const float tbound;
    const float direction;
    const size_t dims;

    //runtime buffers and variables
    float h_abs;
    float ern;
    size_t status;
    float t;
    float y[3] = {0, 0, 0};
    float f[3] = {0, 0, 0};
    float yt[3] = {0, 0, 0};
    float ft[3] = {0, 0, 0};
    float y1[3] = {0, 0, 0};
    float f1[3] = {0, 0, 0};
    float sc[3] = {0, 0, 0};
    float er[3] = {0, 0, 0};
    float K[21] = {0, 0, 0}; //3 * (n_stages + 1)
};

//-------------------------------------------------------------------------------

DataStreamlines *integrate_3d(const Dataset3D *dataset, float *points, const int32_t count,
                              const float t0, const float tbound)
{
    //positions, values, times
    Buffer<float> y, f, t;
    Buffer<int32_t> l; //streamline lengths
    size_t len;

    //set the buffer for streamline lengths to fixed size
    l.reserve(count);

    RKSolver solver(dataset, t0, tbound, 3);

    //make streamline from each of the points
    for (int32_t i = 0; i < count; i++)
    {
        solver.initial_step(points + 3 * i);
        len = 0;

        //copy initial points and function values from inside solver
        //pushback handles the realloc
        y.push_back(solver.y[0], solver.y[1], solver.y[2]);
        f.push_back(solver.f[0], solver.f[1], solver.f[2]);
        t.push_back(solver.t);

        //while solver is happy
        while (solver.status == SolverStatus::ready)
        {
            solver.step();
            len += 1;

            //copy points and function values from inside solver
            y.push_back(solver.y[0], solver.y[1], solver.y[2]);
            f.push_back(solver.f[0], solver.f[1], solver.f[2]);
            t.push_back(solver.t);
        }

        l[i] = len;
    }

    DataStreamlines *stream = new DataStreamlines();
    stream->y = y.data, stream->dy = y.filled;
    y.rob();
    stream->f = f.data, stream->df = f.filled;
    f.rob();
    stream->t = t.data, stream->dt = t.filled;
    t.rob();
    stream->l = l.data, stream->dl = l.filled;
    l.rob();

    return stream;
}

//-------------------------------------------------------------------------------

bool compare_datasets_3d(const dataset_line3D &i1, const dataset_line3D &i2)
{
    if (i1.x == i2.x)
    {
        if (i1.y == i2.y)
            return i1.z < i2.z;
        else
            return i1.y < i2.y;
    }
    else
        return i1.x < i2.x;
}

bool compare_datasets_2d(const dataset_line2D &i1, const dataset_line2D &i2)
{
    if (i1.x == i2.x)
        return i1.y < i2.y;
    else
        return i1.x < i2.x;
}

//sort matrix rows according to 3-6th or 2-4th columns
void dataset_sort(float *data, int32_t columns, int32_t rows)
{
    if (columns == 6)
        sort((dataset_line3D *)data, (dataset_line3D *)data + rows, compare_datasets_3d);
    else if (columns == 4)
        sort((dataset_line2D *)data, (dataset_line2D *)data + rows, compare_datasets_2d);
}

//try to add uniques to buffer of unique values, values remain sorted
void add_unique(Buffer<float> &uniques, Buffer<size_t> &counts, float value, float epsilon)
{
    size_t idx = uniques.lower_bound(value);

    if (idx == uniques.filled || abs(uniques[idx] - value) > epsilon)
        uniques.insert(idx, value), counts.insert(idx, 1);
    else
        counts[idx] += 1;
}

//gets unique coordinates of all axis
//also test for rectilinear grid
bool is_rectilinear_3d(float *values, size_t count, float epsilon,
                       Buffer<float> &ux, Buffer<float> &uy, Buffer<float> &uz)
{
    Buffer<size_t> xcount, ycount, zcount;

    size_t idx = 0;
    while (idx < count)
    {
        add_unique(ux, xcount, values[idx++], epsilon);
        add_unique(uy, ycount, values[idx++], epsilon);
        add_unique(uz, zcount, values[idx++], epsilon);
        idx += 3;
        //cout << idx << endl;
    }

    size_t coutns = xcount[0];
    for (size_t i = 1; i < xcount.filled; i++)
        if (xcount[i] != coutns)
            return false;

    coutns = ycount[0];
    for (size_t i = 1; i < ycount.filled; i++)
        if (ycount[i] != coutns)
            return false;

    coutns = zcount[0];
    for (size_t i = 1; i < zcount.filled; i++)
        if (zcount[i] != coutns)
            return false;

    return true;
}

//load 3D dataset
Dataset3D *load_rectilinear_3d(const DataMatrix *mat, float epsilon)
{
    Buffer<float> ux, uy, uz;
    size_t size = mat->columns * mat->rows;

    if (!is_rectilinear_3d(mat->data, size, epsilon, ux, uy, uz))
        return nullptr;

    dataset_sort(mat->data, 6, mat->rows);

    //create dataset
    Dataset3D *dataset = new Dataset3D();
    dataset->dx = ux.filled;
    dataset->dy = uy.filled;
    dataset->dz = uz.filled;

    dataset->ax = ux.data;
    dataset->ay = uy.data;
    dataset->az = uz.data;

    ux.rob(), uy.rob(), uz.rob();

    //dataset->data = mat->data; // not necessary here
    return dataset;
}

float parse_nans(const string & num)
{
    if (num == "NaN")
        return NAN;
    else 
        return stof(num); 
}

//parse .csv file
DataMatrix *parse_file(const char *filename, const char *sep)
{
    ifstream file(filename);
    size_t dims = 0, clines = 0;
    string line;
    unsigned char s1, s2, s3, s4, s5;
    float x, y, z, vx, vy, vz;
    string svx, svy, svz;
    Buffer<float> values;

    //number of dimensions
    getline(file, line);
    for (const char c : line)
        if (c == *sep)
            dims++;

    file.seekg(0, file.beg);
    while (getline(file, line))
        clines++;

    file.clear();
    file.seekg(0, file.beg);

    //3d dataset
    if (dims == 5)
    {
        values.reserve(6 * clines);
        while (!file.eof() && file >> line)
        {
            stringstream s_stream(line);
            if (!(s_stream >> x >> s1 >> y >> s2 >> z >> s3))
                break;

            getline(s_stream, svx, ',');
            vx = parse_nans(svx);
            getline(s_stream, svy, ',');
            vy = parse_nans(svy);
            getline(s_stream, svz, ',');
            vz = parse_nans(svz);

            //separators checking, might be usefull for safety
            /*if (!(s1 == *sep && s2 == *sep && s3 == *sep 
                  && s4 == *sep && s5 == *sep))
                {
                    cout << s1 << " " << s2 << " " << s3 << " " << s4 << " " << s5 << endl;
                    return nullptr;
                }*/

            values.push_back(x, y, z, vx, vy, vz);
        }
    }
    //2d dataset
    else if (dims == 3)
    {
        return nullptr; //not implemented
    }
    else
        return nullptr; //unknown

    //now all data is in memory
    if (!file.eof())
        return nullptr;
    file.close();

    DataMatrix *mat = new DataMatrix();
    mat->data = values.data;
    mat->columns = dims + 1;
    mat->rows = values.filled / mat->columns;
    values.rob();
    return mat;
}

Dataset3D * construct_level_3d(const Dataset3D * ds, int32_t x, int32_t y, int32_t z)
{
    Dataset3D * nds = new Dataset3D();
    //setup buffers and sizes
    nds->dx = min(max(x, 1), ds->dx);
    nds->dy = min(max(y, 1), ds->dy);
    nds->dz = min(max(z, 1), ds->dz);
    nds->data = new float[nds->dx * nds->dy * nds->dz]{};
    nds->ax = new float[nds->dx];
    nds->ay = new float[nds->dy];
    nds->az = new float[nds->dz];

    //setup axis
    float stepx = (float) ds->dx / nds->dx;
    for (int32_t i = 0; i < nds->dx; i++)
        nds->ax[i] = ds->ax[(size_t)((i + 0.5) * stepx)];
    
    float stepy = (float) ds->dy / nds->dy;
    for (int32_t i = 0; i < nds->dy; i++)
        nds->ay[i] = ds->ay[(size_t)((i + 0.5) * stepy)];

    float stepz = (float) ds->dz / nds->dz;
    for (int32_t i = 0; i < nds->dz; i++)
        nds->az[i] = ds->az[(size_t)((i + 0.5) * stepz)];
    
    //get dataset values as max of assigned region
    size_t oi, ni;
    float len;
    for (int32_t i = 0; i < ds->dx; i++)
    {
        for (int32_t j = 0; j < ds->dy; j++)
        {
            for (int32_t k = 0; k < ds->dz; k++)
            {
                //calculate index in old array
                oi = (i * ds->dy * ds->dz + j * ds->dz + k) * 3;
                ni = (int) (i / stepx) * nds->dy * nds->dz + (int)(j / stepy) * nds->dz + k / stepz;

                len = ds->data[oi] * ds->data[oi] + 
                      ds->data[oi + 1] * ds->data[oi + 1] + 
                      ds->data[oi + 2] * ds->data[oi + 2];

                nds->data[ni] = max(len, nds->data[ni]); 
            }
        }
    }

    return nds;
}

void delete_dataset_3d(Dataset3D *ds)
{
    delete ds;
}

void delete_datamatrix(DataMatrix *dm)
{
    delete dm;
}

void delete_datastreamline(DataStreamlines *ds)
{
    delete ds;
}
