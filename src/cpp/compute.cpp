#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/functional.h>
#include "field.hpp"

#define TINYGLTF_IMPLEMENTATION
#define STB_IMAGE_IMPLEMENTATION
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "deps/gltf/tiny_gltf.h"

namespace py = pybind11;
using namespace std;



//class PyField : public Field {
//public:
//    /* Inherit the constructors */
//    using Field::Field;
//
//    /* Trampoline (need one for each virtual function) */
//    /*virtual const char * type() const override {
//        PYBIND11_OVERRIDE_PURE(
//            const char *,// Return type
//            BaseModel,// Parent class
//            type,// Name of function in C++ (must match Python name)
//            // Argument(s)
//        );
//    }*/
//
//    /* Trampoline (need one for each virtual function) */
//    /*virtual const char * type() const override {
//        PYBIND11_OVERRIDE(
//            const char *,// Return type
//            BaseModel,// Parent class
//            type,// Name of function in C++ (must match Python name)
//            // Argument(s)
//        );
//    }*/
//};



//class PyRectilinearField3D : public RectilinearField3D {
//public:
//    /* Inherit the constructors */
//    using RectilinearField3D::RectilinearField3D;
//};


PYBIND11_MODULE(compute, m) {
    py::class_<RectilinearField3D, std::shared_ptr<RectilinearField3D>>(m, "RectilinearField3D")
        .def(py::init<const string &>())
        .def_property_readonly("data", &RectilinearField3D::data);
}