#pragma once

struct Dataset3D
{
    int32_t dx, dy, dz;
    float *ax, *ay, *az;
    float *data;
};

struct DataMatrix
{
    int32_t rows, columns;
    float * data;
};

struct DataStreamlines
{
    //positions
    float * y;
    int32_t dy;
    //values
    float * f;
    int32_t df;
    //times
    float * t;
    int32_t dt;
    //lengths
    int32_t * l;
    int32_t dl;
};

//loading functions
Dataset3D * load_rectilinear_3d(const DataMatrix * mat, float epsilon);
DataMatrix * parse_file(const char * filename, const char * sep);

//lod
Dataset3D * construct_level_3d(const Dataset3D * ds, int32_t x, int32_t y, int32_t z);


//interpolation
float * interpolate_3d(const Dataset3D * dataset, const float *points, const int32_t count);

//integration
DataStreamlines * integrate_3d(const Dataset3D *dataset, float *points,  const int32_t count, 
                  const float t0, const float tbound);

void delete_dataset_3d(Dataset3D * ds);
void delete_datamatrix(DataMatrix * dm);
void delete_datastreamline(DataStreamlines * ds);