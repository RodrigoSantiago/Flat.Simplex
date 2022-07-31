//
// Created by Rodrigo on 29/07/2022.
//

#ifndef SIMPLEX_OPERATORADD_H
#define SIMPLEX_OPERATORADD_H

#include "../Classes.h"

inline Pointer operator+(const Pointer& a, const Pointer& b) {
    if (a.isNumber() && b.isNumber()) {
        return Pointer(a.getNumber() + b.getNumber());
    }

    if (a.isString() || b.isString()) {
        return Pointer(new String(AS_STRING(a.getString()), AS_STRING(b.getString())));
    }

    return Pointer();
}

inline Pointer operator+(const Chars& a, const Chars& b) {
    return Pointer(new String(a, b));
}

inline Pointer operator+(const Pointer& a, Double b) {
    if (a.isNumber()) {
        return Pointer(a.getNumber() + b);
    }

    if (a.isString()) {
        char num[100];
        return Pointer(new String(AS_STRING(a.getString()), simplex::string(b)));
    }

    return Pointer();
}

inline Pointer operator+(Double a, const Pointer& b) {
    if (b.isNumber()) {
        return Pointer(a + b.getNumber());
    }

    if (b.isString()) {
        return Pointer(new String(simplex::string(a), AS_STRING(b.getString())));
    }

    return Pointer();
}

inline Pointer operator+(const Pointer& a, const Chars& b) {
    return Pointer(new String(AS_STRING(a.getString()), b.chars));
}

inline Pointer operator+(const Chars& a, Double b) {
    return Pointer(new String(a, simplex::string(b)));
}

inline Pointer operator+(const Chars& a, const Pointer& b) {
    return Pointer(new String(a, AS_STRING(b.getString())));
}

#endif //SIMPLEX_OPERATORADD_H
