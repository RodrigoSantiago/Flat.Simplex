//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_REFERENCE_H
#define SIMPLEX_REFERENCE_H

#include "../Base.h"
#include "Value.h"

class Reference : public Value {
public:
    long count;
    Asset* asset;

    Reference();

    Reference(const Reference& copy) = delete;

    Reference(Asset* asset);

    ~Reference() override;

    VariableType::VariableType getType() const final;

    Pointer getTypeName() const final;

    Pointer getString() const final;

    Double getNumber() const final;

    Double getBool() final;

    Value* reference() final;

    void deference() final;

    Pointer& getField(long hashName) final;

    Pointer& setField(long hashName, const Pointer& value) final;

    Pointer& refField(long hashName) final;
};

#endif //SIMPLEX_REFERENCE_H
