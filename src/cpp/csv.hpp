#pragma once
#include "field.hpp"
#include "types.hpp"

using namespace std;

//load csv file in format
//x, y, z, valuex, valuey, valuez
void load_csv(const string & filename, vector<pair<tvec3, tvec3>> & pos_val);




