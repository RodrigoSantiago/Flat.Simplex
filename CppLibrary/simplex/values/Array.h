//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_ARRAY_H
#define SIMPLEX_ARRAY_H

#include "../Base.h"
#include "Value.h"
#include "Pointer.h"

class Array : public Value {
public:
    long count;
    long long size;
    Pointer* pointers;

    Array();
    Array(const Array& copy) = delete;
    explicit Array(const Pointer& length);
    explicit Array(long long size, Pointer* pointers);
    ~Array() override;

    VariableType::VariableType getType() const final;

    Pointer getString() const final;

    Double getBool() final;

    Value* reference() final;

    void deference() final;

    Pointer& index(const Pointer& index) final;

    Pointer& indexNum(Double index) final;
};

template <typename ... T>
inline Pointer a(const T& ... values) {
    constexpr long size = sizeof ... (T);
    return new Array(size, new Pointer[size] {
        values...
    });
}

#endif //SIMPLEX_ARRAY_H
