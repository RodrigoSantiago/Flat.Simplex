//
// Created by Rodrigo on 31/07/2022.
//

#ifndef SIMPLEX_FUNCTION_H
#define SIMPLEX_FUNCTION_H

#include "../Base.h"
#include "Value.h"
#include "Pointer.h"

class Function : public Value {
public:
    Pointer (*function)(Pointer);

    Function();

    Function(const Function& copy);

    explicit Function(Pointer (*function)(Pointer));

    ~Function() override;

    VariableType::VariableType getType() const final;

    Pointer getString() const final;

    Double getBool() final;

    Value* reference() final;

    void deference() final;

    Pointer execute(const Pointer& args) final;
};

inline Pointer f(Pointer (*function)(Pointer)) {
    return Pointer(new Function(function));
}

#endif //SIMPLEX_FUNCTION_H
