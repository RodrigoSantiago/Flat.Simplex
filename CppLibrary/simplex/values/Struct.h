//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_STRUCT_H
#define SIMPLEX_STRUCT_H

#include "../Base.h"
#include "Value.h"
#include "Pointer.h"

struct StructInit {
public:
    long index;
    Pointer value;
};

class Struct : public Value {
public:
    void* variables;

    Struct();
    Struct(const Struct& copy);
    explicit Struct(long size, const StructInit* initList);
    ~Struct() override;

    VariableType::VariableType getType() const final;

    Pointer getString() const final;

    Double getBool() final;

    Value* reference() final;

    void deference() final;

    Pointer& getField(long hashName) final;

    Pointer& setField(long hashName, const Pointer& value) final;

    Pointer& refField(long hashName) final;
};

template <long N>
Pointer o(const StructInit (& initList) [N]) {
    return Pointer(new Struct(N, initList));
}

#endif //SIMPLEX_STRUCT_H
