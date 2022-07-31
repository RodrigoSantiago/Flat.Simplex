//
// Created by Rodrigo on 30/07/2022.
//

#include "Reference.h"
#include "../Simplex.h"

Reference::Reference() : asset(nullptr), count(0) {

}

Reference::Reference(Asset *asset) : asset(asset), count(0) {
    if (asset != nullptr) {
        asset->reference = this;
    }
}

Reference::~Reference() {
    if (asset != nullptr) {
        asset->reference = nullptr;
    }
}

VariableType::VariableType Reference::getType() const {
    return VariableType::Object;
}

Pointer Reference::getTypeName() const {
    return s("Object");
}

Pointer Reference::getString() const {
    return s("Object");
}

Double Reference::getNumber() const {
    return make_nan().number;
}

Double Reference::getBool() {
    return asset != nullptr;
}

DoublePointer Reference::getPointer() {
    return make_ptr(asset);
}

Value *Reference::reference() {
    count++;
    return this;
}

void Reference::deference() {
    if (--count <= 0) {
        delete this;
    }
}

Pointer& Reference::getField(long hashName) {
    if (asset == nullptr) {

        throw simplex::ex_invalid_object();
    } else {
        return asset->getField(hashName);
    }
}

Pointer& Reference::setField(long hashName, const Pointer& value) {
    if (asset == nullptr) {

        throw simplex::ex_invalid_object();
    } else {
        return asset->setField(hashName, value);
    }
}

Pointer &Reference::refField(long hashName) {
    if (asset == nullptr) {

        throw simplex::ex_invalid_object();
    } else {
        return asset->refField(hashName);
    }
}
