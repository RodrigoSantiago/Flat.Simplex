//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_OPERATORAND_H
#define SIMPLEX_OPERATORAND_H

#include "../Classes.h"

inline Pointer operator&(const Pointer& a, const Pointer& b) {
    return a.asNumber() & b.asNumber();
}

inline Pointer operator&(const Chars& a, const Chars& b) {
    return simplex::number(a.chars) & simplex::number(b.chars);
}

inline Pointer operator&(const Pointer& a, Double b) {
    return a.asNumber() & b;
}

inline Pointer operator&(Double a, const Pointer& b) {
    return a & b.asNumber();
}

inline Pointer operator&(const Pointer& a, const Chars& b) {
    return a.asNumber() & simplex::number(b.chars);
}

inline Pointer operator&(const Chars& a, const Pointer& b) {
    return simplex::number(a.chars) & b.asNumber();
}

inline Pointer operator&(const Chars& a, Double b) {
    return simplex::number(a.chars) & b;
}

inline Pointer operator&(Double a, const Chars& b) {
    return a & simplex::number(b.chars);
}

#endif //SIMPLEX_OPERATORAND_H
