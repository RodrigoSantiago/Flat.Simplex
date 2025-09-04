//
// Created by Rodrigo on 30/07/2022.
//

#include "Struct.h"
#include "../Simplex.h"
#include <unordered_map>

#define MAP (*static_cast<std::unordered_map<long, Pointer>*>(variables))

Struct::Struct() {
    variables = new std::unordered_map<long, Pointer>();
}

Struct::Struct(const Struct &copy) {
    variables = new std::unordered_map<long, Pointer>(*static_cast<std::unordered_map<long, Pointer>*>(copy.variables));
}

Struct::Struct(long size, const StructInit *initList) {
    for (long long x = 0; x < size; ++x) {
        switch (initList[x].value.getType()) {
            case VariableType::Array:
            case VariableType::Grid:
            case VariableType::Map:
                simplex::ex_container_value(initList[x].value);
        }
    }
    variables = new std::unordered_map<long, Pointer>();
    for (long long x = 0; x < size; ++x) {
        MAP[initList[x].index] = initList[x].value;
    }
}

Struct::~Struct() {
    delete static_cast<std::unordered_map<long, Pointer>*>(variables);
}

VariableType::VariableType Struct::getType() const {
    return VariableType::Struct;
}

Pointer Struct::getString() const {
    return s("Struct");
}

Double Struct::getBool() {
    return true;
}

Value *Struct::reference() {
    return new Struct(*this);
}

void Struct::deference() {
    delete this;
}

Pointer& Struct::getField(long hashName) {
    auto find = MAP.find(hashName);
    if (find == MAP.end()) {
        return Value::getField(hashName);
    } else {
        return find->second;
    }
}

Pointer& Struct::setField(long hashName, const Pointer& value) {
    switch (value.getType()) {
        case VariableType::Array:
        case VariableType::Grid:
        case VariableType::Map:
            simplex::ex_container_value(value);
    }

    auto find = MAP.find(hashName);
    if (find == MAP.end()) {
        return MAP[hashName] = value;
    } else {
        return find->second = value;
    }
}

Pointer &Struct::refField(long hashName) {
    auto find = MAP.find(hashName);
    if (find == MAP.end()) {
        return Value::refField(hashName);
    } else {
        return find->second;
    }
}