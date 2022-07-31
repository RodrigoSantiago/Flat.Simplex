//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_OPERATORLSEQ_H
#define SIMPLEX_OPERATORLSEQ_H

#include "../Classes.h"

inline Pointer operator<=(const Pointer& a, const Pointer& b) {
    return Pointer(a.getNumber() <= b.getNumber());
}

inline Pointer operator<=(const Chars& a, const Chars& b) {
    return Pointer(simplex::strcmp(a.chars, b.chars) <= 0 ? 1.0_d : 0.0_d);
}

inline Pointer operator<=(const Pointer& a, Double b) {
    return Pointer(a.getNumber() <= b);
}

inline Pointer operator<=(Double a, const Pointer& b) {
    return Pointer(a <= b.getNumber());
}

inline Pointer operator<=(const Pointer& a, const Chars& b) {
    return Pointer(a.isString() && simplex::strcmp(AS_STRING(a.getString()).chars, b.chars) <= 0 ? 1.0_d : 0.0_d);
}

inline Pointer operator<=(const Chars& a, Double b) {
    return Pointer(0.0_d);
}

inline Pointer operator<=(const Chars& a, const Pointer& b) {
    return Pointer(b.isString() && simplex::strcmp(a.chars, AS_STRING(b.getString()).chars) <= 0 ? 1.0_d : 0.0_d);
}

#endif //SIMPLEX_OPERATORLSEQ_H
