//
// Created by Rodrigo on 30/07/2022.
//

#include "Simplex.h"
#include <cstring>
#include <cstdio>
#include <iostream>

void * operator new[](decltype(sizeof(0)) n) noexcept(false) {
    return malloc(n);
}

void operator delete[](void * p) noexcept {
    free(p);
}

char* strValue = new char[255];

const char* VariableType::str(VariableType type)  {
    switch (type) {
        case Undefined: return "Undefined";
        case Number: return "Number";
        case String: return "String";
        case Struct: return "Struct";
        case Array: return "Array";
        case Map: return "Map";
        case Grid: return "Grid";
        case Object: return "Object";
        case Arguments: return "Arguments";
        case Function: return "Function";
    }
    return "";
}

char *simplex::string(const Double value) {
    if (IS_ANY(value)) {
        strcpy(strValue, "undefined");
    } else if (value.value == INF) {
        strcpy(strValue, "infinite");
    } else if (value.value == NEG_INF) {
        strcpy(strValue, "-infinite");
    } else {
        sprintf(strValue, "%lg", value.value);
    }
    return strValue;
}
