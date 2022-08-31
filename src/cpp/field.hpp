#pragma once
#include <vector>

using namespace std;


class Field {
public:
    Field();
};


class RectilinearField3D: public Field {
public:
    RectilinearField(const string & filename);

protected:
    double dx, dy, dz;
    vector<vector<vector<double>>> field;
};

