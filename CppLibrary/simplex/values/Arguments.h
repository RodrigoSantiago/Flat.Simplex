//
// Created by Rodrigo on 31/07/2022.
//

#ifndef SIMPLEX_ARGUMENTS_H
#define SIMPLEX_ARGUMENTS_H

#include "../Base.h"
#include "Value.h"
#include "Pointer.h"

struct ArgumentsInit {
public:
    long index;
    Pointer value;
};

class Arguments : public Value {
public:
    void* args;

    Arguments();
    Arguments(const Arguments& copy);
    explicit Arguments(long size, const ArgumentsInit* initList);
    ~Arguments() override;

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
Pointer args(const ArgumentsInit (& initList) [N]) {
    return Pointer(new Arguments(N, initList));
}

#endif //SIMPLEX_ARGUMENTS_H
