#include <iostream>
#include <fstream>
#include <sstream>
#include "types.hpp"
#include "csv.hpp"


void load_csv(const string & filename, vector<pair<tvec3, tvec3>> & pos_val) {
    ifstream file(filename);
    string line;
    tfloat vx, vy, vz, x, y, z;
    char comma;

    while (getline(file, line)) {
        stringstream ss(line);
        //take care of sparating commas
        if (ss >> x >> comma >> y >> comma >> z >> comma >> vx >> comma >> vy >> comma >> vz) {
            pos_val.push_back(make_pair(tvec3(x, y, z), tvec3(vx, vy, vz)));
        }
    }
}