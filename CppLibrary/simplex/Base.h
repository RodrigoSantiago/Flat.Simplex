//
// Created by Rodrigo on 27/07/2022.
//

#ifndef SIMPLEX_BASE_H
#define SIMPLEX_BASE_H

#include <unordered_map>
#include <algorithm>
#include <iostream>
#include <vector>

class Value;
class Pointer;
class String;
class Struct;
class Array;
class Map;
class Grid;
class Object;
class Managed;
class Function;
class Reference;
class Arguments;

#if defined(_MSC_VER)
typedef int int32;
typedef unsigned int uint32;
#elif defined(__SIZEOF_INT__) && __SIZEOF_INT__ == 4
typedef int int32;
typedef unsigned int uint32;
#elif defined(__SIZEOF_LONG__) && __SIZEOF_LONG__ == 4
typedef long INT32;
typedef unsigned long UINT32;
#else
    #error "No 32 bits int found"
#endif

#if defined(_MSC_VER)
typedef long long int64;
typedef unsigned long long uint64;
#elif defined(__SIZEOF_LONG__) && __SIZEOF_LONG__ == 8
typedef long int64;
typedef unsigned long uint64;
#elif defined(__SIZEOF_LONG_LONG__) && __SIZEOF_LONG_LONG__ == 8
typedef long long int64;
typedef unsigned long long uint64;
#else
    #error "No 64 bits int found"
#endif

#include "Double.h"
#include "Chars.h"

union DoublePointer {
    unsigned long long bits;
    Double number;
};

#define IS_ANY(v) ((v).value != (v).value)


#define INF (1.0/0.0)
#define NEG_INF (-1.0/0.0)
#define EPSILON  0.0000001
#define MASK_SIGN  0x8000000000000000UL // to extract the sign bit
#define MASK_PTR   0x0000ffffffffffffUL // to extract the pointer bits
#define QNAN  0xfff8000000000000UL

#define IS_NAN(v) ((v).bits == QNAN)
#define IS_NUMBER(v) ((v).number.value == (v).number.value)
#define IS_OBJECT(v) ((v).number.value != (v).number.value && (v).bits != QNAN)
#define AS_OBJECT(v) (static_cast<Value*>(reinterpret_cast<void*>(((v).bits) & MASK_PTR)))

#define AS_STRING(p) (*static_cast<String*>(reinterpret_cast<void*>(((p).data.bits) & MASK_PTR)))

inline DoublePointer make_num(Double value) {
    return value.value == value.value ? DoublePointer{.number = value} : DoublePointer{.bits = QNAN};
}

inline DoublePointer make_nan() {
    return DoublePointer{.bits = QNAN};
}

inline DoublePointer make_ptr(Value *ptr) {
    return DoublePointer{.bits = QNAN | reinterpret_cast<unsigned long long>(static_cast<void*>(ptr))};
}

inline DoublePointer make_ptr(Managed *ptr) {
    return DoublePointer{.bits = QNAN | reinterpret_cast<unsigned long long>(static_cast<void*>(ptr))};
}

namespace simplex {
    char* string(const Double value);

    Double number(const char* value);

    void* alloc(decltype(sizeof(0)) size);

    void dealloc(void* ptr);
}

namespace VariableType {
    enum VariableType : char {
        Undefined, Number, String, Struct, Array, Map, Grid, Object, Arguments, Function
    };

    const char* str(VariableType type);
}

#endif //SIMPLEX_BASE_H
