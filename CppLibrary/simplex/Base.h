//
// Created by Rodrigo on 27/07/2022.
//

#ifndef SIMPLEX_BASE_H
#define SIMPLEX_BASE_H

class Value;
class Pointer;
class Setter;
class String;
class Struct;
class Array;
class Map;
class Object;
class Asset;
class Function;
class Reference;
class Arguments;

#include "Double.h"
#include "Chars.h"

union DoublePointer {
    unsigned long long bits;
    Double number;
};

#define IS_ANY(v) (v.value != v.value)


#define INF 1.0/0.0
#define NEG_INF -1.0/0.0
#define EPSILON  0.0000001
#define MASK_SIGN  0x8000000000000000UL // to extract the sign bit
#define MASK_PTR   0x0000ffffffffffffUL // to extract the pointer bits
#define QNAN  0xfff8000000000000UL

#define IS_NAN(v) (v.bits == QNAN)
#define IS_NUMBER(v) (v.number.value == v.number.value)
#define IS_OBJECT(v) (v.number.value != v.number.value && v.bits != QNAN)
#define AS_OBJECT(v) (reinterpret_cast<Value*>((v.bits) & MASK_PTR))

#define AS_STRING(p) (*static_cast<String*>(reinterpret_cast<Value*>((p.data.bits) & MASK_PTR)))

inline DoublePointer make_num(Double value) {
    return value.value == value.value ? DoublePointer{.number = value} : DoublePointer{.bits = QNAN};
}

inline DoublePointer make_nan() {
    return DoublePointer{.bits = QNAN};
}

inline DoublePointer make_ptr(Value *ptr) {
    return DoublePointer{.bits = QNAN | (unsigned long long)(ptr)};
}

inline DoublePointer make_ptr(Asset *ptr) {
    return DoublePointer{.bits = QNAN | (unsigned long long)(ptr)};
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
