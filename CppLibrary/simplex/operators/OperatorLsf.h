//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_OPERATORLSF_H
#define SIMPLEX_OPERATORLSF_H

#include "../Classes.h"

inline Pointer operator<<(const Pointer& a, const Pointer& b) {
    return Pointer(a.isNumber() && b.isNumber() ? a.getNumber() << b.getNumber() : make_nan().number);
}

inline Pointer operator<<(const Chars& a, const Chars& b) {
    return Pointer();
}

inline Pointer operator<<(const Pointer& a, Double b) {
    return Pointer(a.isNumber() ? a.getNumber() << b : make_nan().number);
}

inline Pointer operator<<(Double a, const Pointer& b) {
    return Pointer(b.isNumber() ? a << b.getNumber() : make_nan().number);
}

inline Pointer operator<<(const Pointer& a, const Chars& b) {
    return Pointer();
}

inline Pointer operator<<(const Chars& a, Double b) {
    return Pointer();
}

inline Pointer operator<<(const Chars& a, const Pointer& b) {
    return Pointer();
}

#endif //SIMPLEX_OPERATORLSF_H
