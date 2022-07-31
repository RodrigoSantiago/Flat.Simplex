//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_OPERATOREQ_H
#define SIMPLEX_OPERATOREQ_H

#include "../Classes.h"

inline Double operator==(const Pointer& a, const Pointer& b) {
    auto aType = a.getType();
    auto bType = b.getType();
    if (aType == bType) {
        switch (aType) {
            case VariableType::Undefined:
                return 1.0_d;
            case VariableType::Number:
                return a.getNumber() == b.getNumber();
            case VariableType::String:
                return simplex::strcmp(AS_STRING(a.getString()).chars, AS_STRING(b.getString()).chars) == 0 ? 1.0_d : 0.0_d;
            default:
                return a.getPointer().bits == b.getPointer().bits ? 1.0_d : 0.0_d;
        }
    }
    return 0.0_d;
}

inline Double operator==(const Chars& a, const Chars& b) {
    return simplex::strcmp(a.chars, b.chars) == 0 ? 1.0_d : 0.0_d;
}

inline Double operator==(const Pointer& a, Double b) {
    return a.getNumber() == b;
}

inline Double operator==(Double a, const Pointer& b) {
    return a == b.getNumber();
}

inline Double operator==(const Pointer& a, const Chars& b) {
    return a.isString() && simplex::strcmp(AS_STRING(a.getString()).chars, b.chars) == 0 ? 1.0_d : 0.0_d;
}

inline Double operator==(const Chars& a, Double b) {
    return 0.0_d;
}

inline Double operator==(const Chars& a, const Pointer& b) {
    return b.isString() && simplex::strcmp(a.chars, AS_STRING(b.getString()).chars) == 0 ? 1.0_d : 0.0_d;
}

#endif //SIMPLEX_OPERATOREQ_H
