#include "field.hpp"
#include "csv.hpp"

RectilinearField3D::RectilinearField3D(const string & filename) {
    load_csv(filename, field);
}