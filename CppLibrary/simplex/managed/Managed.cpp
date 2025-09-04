//
// Created by Rodrigo on 30/07/2022.
//

#include "Managed.h"
#include "../Simplex.h"
#include <unordered_map>

Managed::Managed(Type type) : type(type), reference(new Reference(this)) {
}

Pointer& Managed::getField(long hashName) {
    auto find = variables.find(hashName);
    if (find == variables.end()) {

        simplex::ex_missing_field(HashName::getName(hashName), getTypeName());
    } else {
        return find->second;
    }
}

Pointer& Managed::setField(long hashName, const Pointer& value) {
    return variables[hashName] = value;
}

Pointer& Managed::refField(long hashName) {
    auto find = variables.find(hashName);
    if (find == variables.end()) {

        simplex::ex_missing_field(HashName::getName(hashName), getTypeName());
    } else {
        return find->second;
    }
}

Managed::~Managed() {
    if (reference != nullptr) {
        if (reference->count == 0) {
            delete reference;
        } else {
            reference->asset = nullptr;
        }
    }
}

Pointer Managed::getTypeName() {
    return s("Managed");
}
