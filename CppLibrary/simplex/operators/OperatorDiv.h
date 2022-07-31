//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_OPERATORDIV_H
#define SIMPLEX_OPERATORDIV_H

#include "../Classes.h"

inline Pointer operator/(const Pointer& a, const Pointer& b) {
    return Pointer(a.getNumber() / b.getNumber());
}

inline Pointer operator/(const Chars& a, const Chars& b) {
    return Pointer();
}

inline Pointer operator/(const Pointer& a, Double b) {
    return Pointer(a.getNumber() / b);
}

inline Pointer operator/(Double a, const Pointer& b) {
    return Pointer(a / b.getNumber());
}

inline Pointer operator/(const Pointer& a, const Chars& b) {
    return Pointer();
}

inline Pointer operator/(const Chars& a, Double b) {
    return Pointer();
}

inline Pointer operator/(const Chars& a, const Pointer& b) {
    return Pointer();
}

#endif //SIMPLEX_OPERATORDIV_H
