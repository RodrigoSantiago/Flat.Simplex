//
// Created by Rodrigo on 31/07/2022.
//

#include "Arguments.h"
#include "../Simplex.h"
#include <unordered_map>

#define MAP (*static_cast<std::unordered_map<long, Pointer>*>(args))

Arguments::Arguments() {
    args = new std::unordered_map<long, Pointer>();
}

Arguments::Arguments(const Arguments &copy) {
    args = new std::unordered_map<long, Pointer>(*static_cast<std::unordered_map<long, Pointer>*>(copy.args));
}

Arguments::Arguments(long size, const ArgumentsInit *initList) {
    args = new std::unordered_map<long, Pointer>();
    for (long long x = 0; x < size; ++x) {
        MAP[initList[x].index] = initList[x].value;
    }
}

Arguments::~Arguments() {
    delete static_cast<std::unordered_map<long, Pointer>*>(args);
}

VariableType::VariableType Arguments::getType() const {
    return VariableType::Arguments;
}

Pointer Arguments::getString() const {
    return s("Arguments");
}

Double Arguments::getBool() {
    return true;
}

Value *Arguments::reference() {
    return new Arguments(*this);
}

void Arguments::deference() {
    delete this;
}

Pointer& Arguments::getField(long hashName) {
    auto find = MAP.find(hashName);
    if (find == MAP.end()) {
        return Value::getField(hashName);
    } else {
        return find->second;
    }
}

Pointer& Arguments::setField(long hashName, const Pointer& value) {
    auto find = MAP.find(hashName);
    if (find == MAP.end()) {
        return MAP[hashName] = value;
    } else {
        return find->second = value;
    }
}

Pointer &Arguments::refField(long hashName) {
    auto find = MAP.find(hashName);
    if (find == MAP.end()) {
        return Value::refField(hashName);
    } else {
        return find->second;
    }
}