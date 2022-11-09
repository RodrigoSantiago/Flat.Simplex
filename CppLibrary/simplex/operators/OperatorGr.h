//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_OPERATORGR_H
#define SIMPLEX_OPERATORGR_H

#include "../Classes.h"

inline Double operator>(const Pointer& a, const Pointer& b) {
    if (a.isNumber() || b.isNumber()) {
        return a.asNumber() > b.asNumber();
    } else {
        return simplex::strcmp(AS_STRING(a.getString()).chars, AS_STRING(b.getString()).chars) > 0 ? 1.0_d : 0.0_d;
    }
}

inline Double operator>(const Chars& a, const Chars& b) {
    return simplex::strcmp(a.chars, b.chars) > 0 ? 1.0_d : 0.0_d;
}

inline Double operator>(const Pointer& a, Double b) {
    return a.asNumber() > b;
}

inline Double operator>(Double a, const Pointer& b) {
    return a > b.asNumber();
}

inline Double operator>(const Pointer& a, const Chars& b) {
    if (a.isNumber()) {
        return a.getNumber() > simplex::number(b.chars);
    } else {
        return simplex::strcmp(AS_STRING(a.getString()).chars, b.chars) > 0 ? 1.0_d : 0.0_d;
    }
}

inline Double operator>(const Chars& a, const Pointer& b) {
    if (b.isNumber()) {
        return simplex::number(a.chars) > b.getNumber();
    } else {
        return simplex::strcmp(a.chars, AS_STRING(b.getString()).chars) > 0 ? 1.0_d : 0.0_d;
    }
}

inline Double operator>(const Chars& a, Double b) {
    return simplex::number(a.chars) > b;
}

inline Double operator>(Double a, const Chars& b) {
    return a > simplex::number(b.chars);
}

#endif //SIMPLEX_OPERATORGR_H
