#include "field.hpp"
#include "csv.hpp"
#include <unordered_map>


Field::Field() {
}

RectilinearField3D::RectilinearField3D(const string & filename) : Field() {
    vector<pair<tvec3, tvec3>> pos_val;
    load_csv(filename, pos_val);
    if (!prepare_coord_field(pos_val))
        throw runtime_error("Failed to prepare coordinate field");
}


bool test_all_counts_equal(const unordered_map<tfloat, size_t> & counts) {
    if (counts.size() == 0)
        return false;

    size_t size = counts.begin()->second;
    for (const auto & p : counts) {
        if (size != p.second) {
            return false;
        }
    }
    return true;
}

void sort_by_positions(vector<pair<tvec3, tvec3>> & pos_val) {
    sort(pos_val.begin(), pos_val.end(), [](const pair<tvec3, tvec3> & a, const pair<tvec3, tvec3> & b) {
        if (a.first.x == b.first.x) {
            if (a.first.y == b.first.y) {
                return a.first.z < b.first.z;
            } else {
                return a.first.y < b.first.y;
            }
        } else {
            return a.first.x < b.first.x;
        }
    });
}


bool RectilinearField3D::prepare_coord_field(vector<pair<tvec3, tvec3>> & pos_val) {
    //count unique positions
    unordered_map<tfloat, size_t> x, y, z;
    for (auto & p : pos_val) {
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

    //check if all counts are equal
    if (!test_all_counts_equal(x) || !test_all_counts_equal(y) || !test_all_counts_equal(z)) {
        return false;
    }

    //fill x, y, z coordinates
    x_coords.resize(x.size());
    y_coords.resize(y.size());
    z_coords.resize(z.size());
    for (const auto & p : x) {
        x_coords[p.second] = p.first;
    }

    for (const auto & p : y) {
        y_coords[p.second] = p.first;
    }

    for (const auto & p : z) {
        z_coords[p.second] = p.first;
    }

    //fill field
    field.resize(x.size());
    for (size_t i = 0; i < x.size(); i++) {
        field[i].resize(y.size());
        for (size_t j = 0; j < y.size(); j++) {
            field[i][j].resize(z.size());
        }
    }

    //sort positions and values accordingly
    sort_by_positions(pos_val);

    for (size_t i = 0; i < x.size(); i++) {
        for (size_t j = 0; j < y.size(); j++) {
            for (size_t k = 0; k < z.size(); k++) {
                field[i][j][k] = pos_val[i * y.size() * z.size() + j * z.size() + k].second;
            }
        }
    }

    return true;
}

vector<tfloat> RectilinearField3D::data() const {
    vector<tfloat> fcopy;
    for (const auto & x : field) {
        for (const auto & y : x) {
            for (const auto & z : y) {
                fcopy.push_back(z.x);
                fcopy.push_back(z.y);
                fcopy.push_back(z.z);
            }
        }
    }
    return fcopy;
}