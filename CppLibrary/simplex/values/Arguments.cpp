//
// Created by Rodrigo on 31/07/2022.
//

#include "Arguments.h"
#include "../Simplex.h"
#include <unordered_map>

Arguments::Arguments() : length(0), request(0) {
    args = nullptr;
    extras = nullptr;
}

Arguments::Arguments(const Arguments &copy) : length(copy.length), request(copy.request) {
    if (copy.args != nullptr) {
        args = new Pointer[copy.length];
        for (long i = 0; i < length; ++i) {
            args[i] = copy.args[i];
        }
    } else {
        args = nullptr;
    }

    if (copy.extras != nullptr) {
        long eSize = copy.request - copy.length;
        extras = new Pointer[eSize];
        for (long i = 0; i < eSize; ++i) {
            extras[i] = copy.extras[i];
        }
    } else {
        extras = nullptr;
    }
}

Arguments::Arguments(long size, Pointer *initList) : length(size), args(initList), request(0), extras(nullptr) {

}

Arguments::~Arguments() {
    delete[] args;
    delete[] extras;
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
    return hashName < length ? args[hashName] : extras[hashName - length];
}

Pointer& Arguments::setField(long hashName, const Pointer& value) {
    return hashName < length ? args[hashName] : extras[hashName - length];
}

Pointer &Arguments::refField(long hashName) {
    return hashName < length ? args[hashName] : extras[hashName - length];
}

void Arguments::reserve(long requestLength) {
    if (requestLength > this->length) {
        request = requestLength;
        extras = new Pointer[request - this->length];
    }
}