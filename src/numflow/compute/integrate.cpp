#include "interpolate.hpp"
#include "integrate.hpp"

// Matrices for 4th order RK step
const tfloat A[25] = {1.0 / 5.0, 0.0, 0.0, 0.0, 0.0,
                      3.0 / 40.0, 9.0 / 40.0, 0.0, 0.0, 0.0,
                      44.0 / 45.0, -(56.0 / 15.0), 32.0 / 9.0, 0.0, 0.0,
                      19372.0 / 6561.0, -(25360.0 / 2187.0), 64448.0 / 6561.0, -(212.0 / 729.0), 0.0,
                      9017.0 / 3168.0, -(355.0 / 33.0), 46732.0 / 5247.0, 49.0 / 176.0, -(5103.0 / 18656.0)};

const tfloat B[6] = {35.0 / 384.0, 0.0, 500.0 / 1113.0, 125.0 / 192.0, -(2187.0 / 6784.0), 11.0 / 84.0};
const tfloat C[5] = {1.0 / 5.0, 3.0 / 10.0, 4.0 / 5.0, 8.0 / 9.0, 1.0};
const tfloat E[7] = {-(71.0 / 57600.0), 0.0, 71.0 / 16695.0, -(71.0 / 1920.0), 17253.0 / 339200.0, -(22.0 / 525.0), 1.0 / 40.0};

// Constants
const tfloat SAFETY = 0.9;     // Multiply steps computed from asymptotic behaviour of errors by this.
const tfloat MIN_FACTOR = 0.2; // Minimum allowed decrease in a step size.
const tfloat MAX_FACTOR = 10;  // Maximum allowed increase in a step size.

float norm(float *val)
{
    return sqrt(val[0] * val[0] + val[1] * val[1] + val[2] * val[2]);
}

float dot(const tfloat *vec_a, const tfloat *vec_b, const int32_t vec_l,
          const int32_t stride_a, const int32_t stride_b)
{
    tfloat d = 0.0;
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
    RKSolver(const shared_ptr<RectilinearField3D> _dataset, tfloat _t0, tfloat _tbound)
        : dataset(_dataset), order(4), n_stages(6),
          atol(1e-6), rtol(1e-3), t0(_t0), tbound(_tbound),
          direction(tbound - t0 > 0 ? 1 : -1), dims(3), status(SolverStatus::ready)
    {
        cout << "RKSolver created" << endl;
        cout << "t0 " << t0 << endl;
        cout << "tbound " << tbound << endl;
    };

    // Initial step of integration, sets up internal variables
    // and selects initial step value. In case solver was used previously,
    // restarts time and status.
    void initial_step(const tfloat y0[3])
    {
        tfloat d0, d1, d2, h0, h1;

        // restarting, just to make sure
        t = t0;
        status = SolverStatus::ready;

        // TODO - replace with time interpolation, value t0 (t)
        interpolate_3d_single_point(dataset, y0, f);

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
        interpolate_3d_single_point(dataset, y1, f1);

        for (size_t i = 0; i < dims; i++)
            ft[i] = (f1[i] * f[i]) / sc[i];

        d2 = norm(ft) / h0;

        if (d1 <= 1e-15 && d2 <= 1e-15)
            h1 = fmax(1e-6, h0 * 1e-3);
        else
            h1 = pow(0.01 / fmax(d1, d2), 1.0 / (order + 1));

        h_abs = fmin(100 * h0, h1);
    };

    // Perform one step. Updates internal values.
    void step()
    {
        // initial checks
        if (status == SolverStatus::finished || status == SolverStatus::failed)
            return;

        // declaring all necessary
        tfloat t_new;
        tfloat min_step = 10.0 * (nextafter(t, tbound) - t);
        tfloat lh_abs = h_abs; // absolute dt
        tfloat h = 0;          // actualy is dt
        int32_t accepted = 0;

        // if dt is smaller than minimal step
        // max_step is infinity so no need to check if h_abs is higher
        if (h_abs < min_step)
            lh_abs = min_step;

        while (!accepted)
        {
            if (lh_abs < min_step)
            {
                status = SolverStatus::failed;
                return;
            }

            // h is now real dt with accurate directin
            h = lh_abs * direction;
            t_new = t + h;

            // check for bounds and update h (dt)
            if ((t_new - tbound) * direction > 0)
                t_new = tbound;

            h = t_new - t;
            lh_abs = fabs(h);

            // perform step, error is implemented inside
            rk_step(h);
            // y_new -> self.y1, f_new -> self.f1, err_nrm -> self.ern

            if (ern == 0.0)
            {
                lh_abs *= MAX_FACTOR;
                accepted = 1;
            }
            else if (ern < 1)
            {
                lh_abs *= fmin(MAX_FACTOR, fmax(1.0, SAFETY * pow(ern, -(1.0 / (order + 1.0)))));
                accepted = 1;
            }
            else
                lh_abs *= fmax(MIN_FACTOR, SAFETY * pow(ern, -(1.0 / (order + 1.0))));
        }

        t = t_new;
        h_abs = lh_abs;
        for (size_t i = 0; i < dims; i++)
            y[i] = y1[i], f[i] = f1[i];

        // check for finish
        if (direction * (t - tbound) >= 0)
            status = SolverStatus::finished;
    };

    // Low level implementation of single
    // Runge-Kutta step.
    //
    // Significant calculated values:
    //     this->y1  - new position (vector)
    //     this->f1  - new function value (vector)
    //     this->er  - error rate (vector)
    //     this->ern - norm from error rate (value)
    void rk_step(tfloat h)
    {
        tfloat tmp = 0.0;

        // prepare K matrix and init y1 (new_y)
        for (size_t i = 0; i < dims; i++)
        {
            K[0 * dims + i] = f[i];
            y1[i] = 0;
            er[i] = 0;
        }

        // 5 as constant size of A and C
        for (size_t i = 0; i < 5; i++)
        {
            // for each component
            for (size_t c = 0; c < dims; c++)
            {
                // Dot product with transposed K,
                // transposition is done using strides
                tmp = dot(&A[i * 5], &K[c], i + 1, 1, dims);
                yt[c] = tmp * h + y[c];
            }
            // TODO - time interpolation, value = t + c[i] * h
            interpolate_3d_single_point(dataset, yt, &K[(i + 1) * dims]);
        }

        // dotproduct with B, adding the rest from above
        for (size_t c = 0; c < dims; c++)
            y1[c] = y[c] + h * dot(&K[c], B, 6, dims, 1);

        // TODO - time interpolation, value = t + h
        // f1 will be in K on 6th row
        interpolate_3d_single_point(dataset, y1, &K[6 * dims]);

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

    // const settings
    const shared_ptr<RectilinearField3D> dataset;
    const size_t order;
    const size_t n_stages;
    const tfloat atol;
    const tfloat rtol;
    const tfloat t0;
    const tfloat tbound;
    const tfloat direction;
    const size_t dims;

    // runtime buffers and variables
    tfloat h_abs;
    tfloat ern;
    size_t status;
    tfloat t;
    tfloat y[3] = {0, 0, 0};
    tfloat f[3] = {0, 0, 0};
    tfloat yt[3] = {0, 0, 0};
    tfloat ft[3] = {0, 0, 0};
    tfloat y1[3] = {0, 0, 0};
    tfloat f1[3] = {0, 0, 0};
    tfloat sc[3] = {0, 0, 0};
    tfloat er[3] = {0, 0, 0};
    tfloat K[21] = {0, 0, 0}; // 3 * (n_stages + 1)
};

//-------------------------------------------------------------------------------

shared_ptr<DataStreamlines> integrate_3d_core(
    const shared_ptr<RectilinearField3D> dataset,
    const vector<tfloat> &points,
    const tfloat t0,
    const tfloat tbound)
{
    // positions, values, times
    vector<tfloat> y, f, t;
    vector<int32_t> l; // streamline lengths
    size_t len;

    // cout << "points count " << count << endl;

    // set the buffer for streamline lengths to fixed size
    const size_t point_count = points.size() / 3;
    l.reserve(point_count);

    RKSolver solver(dataset, t0, tbound);
    const tfloat *raw_points = points.data();

    // make streamline from each of the points
    for (int32_t i = 0; i < point_count; i++)
    {
        solver.initial_step(raw_points + 3 * i);
        len = 1;

        // copy initial points and function values from inside solver
        // pushback handles the realloc
        // cout << "step " << solver.y[0] << " " << solver.y[1] << " " << solver.y[2] << endl;
        y.insert(y.end(), solver.y, solver.y + 3);
        // cout << solver.f[0] << " " << solver.f[1] << " " << solver.f[2] << endl;
        f.insert(f.end(), solver.f, solver.f + 3);
        t.push_back(solver.t);

        // while solver is happy
        while (solver.status == SolverStatus::ready)
        {
            solver.step();
            len += 1;

            // copy points and function values from inside solver
            // cout << solver.y[0] << " " << solver.y[1] << " " << solver.y[2] << endl;
            // y.push_back(solver.y[0], solver.y[1], solver.y[2]);
            y.insert(y.end(), solver.y, solver.y + 3);
            // cout << solver.f[0] << " " << solver.f[1] << " " << solver.f[2] << endl;
            // f.push_back(solver.f[0], solver.f[1], solver.f[2]);
            f.insert(f.end(), solver.f, solver.f + 3);
            t.push_back(solver.t);
        }

        l.push_back(len);
    }

    DataStreamlines *stream = new DataStreamlines();
    stream->y = move(y);
    stream->f = move(f);
    stream->t = move(t);
    stream->l = move(l);
    return shared_ptr<DataStreamlines>(stream);
}

//-------------------------------------------------------------------------------

shared_ptr<DataStreamlines> integrate_3d(
    const shared_ptr<RectilinearField3D> dataset,
    const py::array_t<tfloat, py::array::c_style | py::array::forcecast> &points,
    const tfloat t0,
    const tfloat tbound)
{
    py::buffer_info info = points.request();
    if (info.ndim != 2)
        throw std::runtime_error("Number of array dimensions passed to interpolate_3d must be 2");
    if (info.shape[1] != 3)
        throw std::runtime_error("Second dimension of array passed to interpolate_3dmust be 3");

    // the data is passed as pointer so the vector does not own it
    vector<tfloat> raw_points = vector<tfloat>((tfloat *)info.ptr, (tfloat *)info.ptr + info.shape[0] * info.shape[1]);
    return integrate_3d_core(dataset, raw_points, t0, tbound);
}