//
// Created by Rodrigo on 30/07/2022.
//

#include "Simplex.h"
#include "Base.h"

#include <cstring>
#include <cstdio>
#include <iostream>

void * operator new(decltype(sizeof(0)) n) noexcept(false) {
    return malloc(n);
}

void operator delete(void * p) noexcept {
    free(p);
}

void * operator new[](decltype(sizeof(0)) n) noexcept(false) {
    return malloc(n);
}

void operator delete[](void * p) noexcept {
    free(p);
}

char* strValueA = new char[255];
char* strValueB = new char[255];
int str = 1;

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
    char* strValue = str ? strValueA : strValueB;
    str = -str;
    if (IS_ANY(value)) {
        strcpy(strValue, "undefined");
    } else if (value.value == INF) {
        strcpy(strValue, "Infinity");
    } else if (value.value == NEG_INF) {
        strcpy(strValue, "-Infinity");
    } else {
        sprintf(strValue, "%lg", value.value);
    }
    return strValue;
}

Double simplex::number(const char *value) {
    if (value == nullptr) return make_nan().number;

    char* err = nullptr;
    Double val = std::strtod(value, &err);
    if ((*err) == 0) {
        if (val.value == INF || val.value == NEG_INF) {
            err = strstr(value, "Infinity");
            if (!err) return make_nan().number;
        }
        return val;
    } else {
        return make_nan().number;
    }
}

void *simplex::alloc(decltype(sizeof(0)) size) {
    return malloc(size);
}

void simplex::dealloc(void* ptr) {
    free(ptr);
}
