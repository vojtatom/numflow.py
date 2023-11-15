#include "field.hpp"
#include "csv.hpp"
#include <unordered_map>
#include <algorithm>

RectilinearField3D::RectilinearField3D(const string &filename)
{
    vector<pair<tvec3, tvec3>> pos_val;
    load_csv(filename, pos_val);
    if (!prepare_coord_field(pos_val))
        throw runtime_error("Failed to prepare coordinate field");
}

bool test_all_counts_equal(const unordered_map<tfloat, size_t> &counts, char axis)
{
    if (counts.size() == 0)
        return false;

    // size of the first element
    size_t size = counts.begin()->second;
    for (const auto &p : counts)
    {
        if (size != p.second)
        {
            cerr << "Counts are not equal, " << size << " != " << p.second << " on axis " << axis << " at " << p.first << endl;
            return false;
        }
    }
    return true;
}

void sort_by_positions(vector<pair<tvec3, tvec3>> &pos_val)
{
    sort(pos_val.begin(), pos_val.end(), [](const pair<tvec3, tvec3> &a, const pair<tvec3, tvec3> &b)
         {
        if (a.first.x == b.first.x) {
            if (a.first.y == b.first.y) {
                return a.first.z < b.first.z;
            } else {
                return a.first.y < b.first.y;
            }
        } else {
            return a.first.x < b.first.x;
        } });
}

bool RectilinearField3D::prepare_coord_field(vector<pair<tvec3, tvec3>> &pos_val)
{
    // count unique positions
    unordered_map<tfloat, size_t> x, y, z;
    for (auto &p : pos_val)
    {
        if (x.find(p.first.x) == x.end())
            x[p.first.x] = 0;
        x[p.first.x]++;
        if (y.find(p.first.y) == y.end())
            y[p.first.y] = 0;
        y[p.first.y]++;
        if (z.find(p.first.z) == z.end())
            z[p.first.z] = 0;
        z[p.first.z]++;
    }

    // check if all counts are equal
    if (!test_all_counts_equal(x, 'x') || !test_all_counts_equal(y, 'y') || !test_all_counts_equal(z, 'z'))
    {
        cerr << "Exiting, not all counts are equal" << endl;
        return false;
    }

    // fill x, y, z coordinates
    for (const auto &p : x)
    {
        x_coords.push_back(p.first);
    }

    for (const auto &p : y)
    {
        y_coords.push_back(p.first);
    }

    for (const auto &p : z)
    {
        z_coords.push_back(p.first);
    }

    sort(x_coords.begin(), x_coords.end());
    sort(y_coords.begin(), y_coords.end());
    sort(z_coords.begin(), z_coords.end());

    // fill field
    velocities.resize(x.size() * y.size() * z.size() * 3);
    dx = x.size();
    dy = y.size();
    dz = z.size();

    // sort positions and values accordingly
    sort_by_positions(pos_val);

    size_t out_i = 0;
    tvec3 vec;
    for (size_t i = 0; i < x.size(); i++)
    {
        for (size_t j = 0; j < y.size(); j++)
        {
            for (size_t k = 0; k < z.size(); k++)
            {
                vec = pos_val[i * y.size() * z.size() + j * z.size() + k].second;
                velocities[out_i++] = vec.x;
                velocities[out_i++] = vec.y;
                velocities[out_i++] = vec.z;
            }
        }
    }

    return true;
}