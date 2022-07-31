//
// Created by Rodrigo on 29/07/2022.
//

#ifndef SIMPLEX_POINTER_H
#define SIMPLEX_POINTER_H

#include "../Base.h"

class Pointer {
public:
    DoublePointer data;

    Pointer();

    explicit Pointer(Struct* value);
    Pointer(Value* value);
    Pointer(const Pointer& copy);
    Pointer(Double d);
    Pointer(const Chars& str);

    Pointer& operator=(Value* value);
    Pointer& operator=(const Pointer& copy);
    Pointer& operator=(Double d);
    Pointer& operator=(const Chars& str);

    void set(Value* value);

    operator bool() const;

    ~Pointer();

    VariableType::VariableType getType() const;

    Pointer getTypeName() const;

    Double getNumber() const;

    Pointer getString() const;

    Double getBool() const;

    DoublePointer getPointer() const;

    bool isUndefined() const;

    bool isNumber() const;

    bool isString() const;

    Value* operator->() const;

    Pointer& operator++();
    Pointer operator++(int);

    Pointer& operator--();
    Pointer operator--(int);

    Pointer& operator+=(const Pointer& copy);
    Pointer& operator+=(Double d);
    Pointer& operator+=(const Chars& str);

    Pointer& operator-=(const Pointer& copy);
    Pointer& operator-=(Double d);
    Pointer& operator-=(const Chars& str);

    Pointer& operator*=(const Pointer& copy);
    Pointer& operator*=(Double d);
    Pointer& operator*=(const Chars& str);

    Pointer& operator/=(const Pointer& copy);
    Pointer& operator/=(Double d);
    Pointer& operator/=(const Chars& str);

    Pointer& operator%=(const Pointer& copy);
    Pointer& operator%=(Double d);
    Pointer& operator%=(const Chars& str);

    Pointer operator-() const;

    Pointer operator+() const;

    Pointer operator!() const;

    Pointer operator~() const;

    Pointer& operator&=(const Pointer& copy);
    Pointer& operator&=(Double d);
    Pointer& operator&=(const Chars& str);

    Pointer& operator|=(const Pointer& copy);
    Pointer& operator|=(Double d);
    Pointer& operator|=(const Chars& str);

    Pointer& operator^=(const Pointer& copy);
    Pointer& operator^=(Double d);
    Pointer& operator^=(const Chars& str);

    Pointer& operator>>=(const Pointer& copy);
    Pointer& operator>>=(Double d);
    Pointer& operator>>=(const Chars& str);

    Pointer& operator<<=(const Pointer& copy);
    Pointer& operator<<=(Double d);
    Pointer& operator<<=(const Chars& str);
};

inline Pointer p(Value* value) {
    return Pointer(value);
}

#endif //SIMPLEX_POINTER_H
