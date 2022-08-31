cmake_minimum_required(VERSION 3.15...3.22)
project(numflow)
set(CMAKE_CXX_STANDARD 14)


if(SKBUILD)
  # Scikit-Build does not add your site-packages to the search path
  # automatically, so we need to add it _or_ the pybind11 specific directory
  # here.
  execute_process(
    COMMAND "${PYTHON_EXECUTABLE}" -c
            "import pybind11; print(pybind11.get_cmake_dir())"
    OUTPUT_VARIABLE _tmp_dir
    OUTPUT_STRIP_TRAILING_WHITESPACE COMMAND_ECHO STDOUT)
  list(APPEND CMAKE_PREFIX_PATH "${_tmp_dir}")
endif()


# Now we can find pybind11
find_package(pybind11 CONFIG REQUIRED)

#add_compile_options(-Wall -pedantic -g) 
add_compile_options(-Wall -pedantic -O3)
#add_link_options(-fsanitize=address -shared-libasan -pthread)
add_link_options(-pthread)

pybind11_add_module(compute         src/cpp/compute.cpp
                                    src/cpp/csv.cpp 
                                    src/cpp/csv.hpp
                                    src/cpp/field.hpp
                                    src/cpp/field.cpp)

install(TARGETS compute DESTINATION .)