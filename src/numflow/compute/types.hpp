#pragma once
#include <vector>
#include <iostream>
#include <memory>

using tfloat = float;

struct tvec3
{
    tfloat x, y, z;
};

enum LookUp
{
    ok,
    outOfRange,
};