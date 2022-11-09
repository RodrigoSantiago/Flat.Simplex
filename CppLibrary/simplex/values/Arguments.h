//
// Created by Rodrigo on 31/07/2022.
//

#ifndef SIMPLEX_ARGUMENTS_H
#define SIMPLEX_ARGUMENTS_H

#include "../Base.h"
#include "Value.h"
#include "Pointer.h"

class Arguments : public Value {
public:
    long length;
    Pointer* args;
    long request;
    Pointer* extras;

    Arguments();

    Arguments(const Arguments& copy);

    explicit Arguments(long size, Pointer* initList);

    ~Arguments() override;

    VariableType::VariableType getType() const final;

    Pointer getString() const final;

    Double getBool() final;

    Value* reference() final;

    void deference() final;

    Pointer& getField(long hashName) final;

    Pointer& setField(long hashName, const Pointer& value) final;

    Pointer& refField(long hashName) final;

    void reserve(long requestLength);
};

template <typename ... T>
inline Pointer args(const T& ... values) {
    constexpr long size = sizeof ... (T);
    return Pointer(new Arguments(size, new Pointer[size] {
            values...
    }));
}

#endif //SIMPLEX_ARGUMENTS_H
