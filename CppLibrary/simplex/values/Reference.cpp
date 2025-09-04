//
// Created by Rodrigo on 30/07/2022.
//

#include "Reference.h"
#include "../Simplex.h"
#include <iostream>

Reference::Reference() : asset(nullptr), count(0) {

}

Reference::Reference(Managed *asset) : asset(asset), count(0) {

}

Reference::~Reference() {

}

VariableType::VariableType Reference::getType() const {
    return VariableType::Object;
}

Pointer Reference::getTypeName() const {
    return asset == nullptr ? s("Undefined") : asset->getTypeName();
}

Pointer Reference::getString() const {
    return asset == nullptr ? s("undefined") : asset->getTypeName();
}

Double Reference::getNumber() const {
    return make_nan().number;
}

Double Reference::getBool() {
    return asset != nullptr;
}

Value *Reference::reference() {
    count++;
    return this;
}

void Reference::deference() {
    --count;
    if (count == 0 && asset == nullptr) {
        delete this;
    }
}

Pointer& Reference::getField(long hashName) {
    if (asset == nullptr) {
        simplex::ex_invalid_object();
    } else {
        return asset->getField(hashName);
    }
}

Pointer& Reference::setField(long hashName, const Pointer& value) {
    if (asset == nullptr) {
        simplex::ex_invalid_object();
    } else {
        return asset->setField(hashName, value);
    }
}

Pointer &Reference::refField(long hashName) {
    if (asset == nullptr) {
        simplex::ex_invalid_object();
    } else {
        return asset->refField(hashName);
    }
}
