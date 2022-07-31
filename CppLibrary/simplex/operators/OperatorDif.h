//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_OPERATORDIF_H
#define SIMPLEX_OPERATORDIF_H

#include "../Classes.h"

inline Pointer operator!=(const Pointer& a, const Pointer& b) {
    auto aType = a.getType();
    auto bType = b.getType();
    if (aType == bType) {
        switch (aType) {
            case VariableType::Undefined:
                return Pointer(0.0_d);
            case VariableType::Number:
                return Pointer(a.getNumber() != b.getNumber());
            case VariableType::String:
                return Pointer(simplex::strcmp(AS_STRING(a.getString()).chars, AS_STRING(b.getString()).chars) != 0 ? 1.0_d : 0.0_d);
            default:
                return Pointer(a.getPointer().bits != b.getPointer().bits ? 1.0_d : 0.0_d);
        }
    }
    return Pointer(1.0_d);
}

inline Pointer operator!=(const Chars& a, const Chars& b) {
    return Pointer(simplex::strcmp(a.chars, b.chars) != 0 ? 1.0_d : 0.0_d);
}

inline Pointer operator!=(const Pointer& a, Double b) {
    return Pointer(a.getNumber() != b);
}

inline Pointer operator!=(Double a, const Pointer& b) {
    return Pointer(a != b.getNumber());
}

inline Pointer operator!=(const Pointer& a, const Chars& b) {
    return Pointer(a.isString() && simplex::strcmp(AS_STRING(a.getString()).chars, b.chars) != 0 ? 1.0_d : 0.0_d);
}

inline Pointer operator!=(const Chars& a, Double b) {
    return Pointer(1.0_d);
}

inline Pointer operator!=(const Chars& a, const Pointer& b) {
    return Pointer(b.isString() && simplex::strcmp(a.chars, AS_STRING(b.getString()).chars) != 0 ? 1.0_d : 0.0_d);
}

#endif //SIMPLEX_OPERATORDIF_H
