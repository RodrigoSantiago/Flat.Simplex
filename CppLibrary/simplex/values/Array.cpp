//
// Created by Rodrigo on 30/07/2022.
//

#include "Array.h"
#include "../Simplex.h"

Array::Array() : pointers(nullptr), count(0) {

}

Array::Array(const Pointer& length) : count(0) {
    if (!length.isNumber()) {

        simplex::ex_array_invalid_length(length);
    }

    this->size = simplex::round(length.getNumber().value);
    if (this->size < 0) {

        simplex::ex_array_invalid_length(length);
    }
    pointers = new Pointer[this->size];
}

Array::Array(long long size, Pointer *pointers) : size(size), pointers(pointers), count(0) {
    Pointer* invalid = nullptr;
    for (long long x = 0; x < size; ++x) {
        switch (pointers[x].getType()) {
            case VariableType::Array:
            case VariableType::Grid:
            case VariableType::Map:
                invalid = &pointers[x];
        }
    }
    if (invalid != nullptr) {
        delete[] pointers;

        simplex::ex_container_value(*invalid);
    }
}

Array::~Array() {
    delete[] pointers;
}

VariableType::VariableType Array::getType() const {
    return VariableType::Array;
}

Pointer Array::getString() const {
    return s("Array");
}

Double Array::getBool() {
    return b(size > 0);
}

Value *Array::reference() {
    count++;
    return this;
}

void Array::deference() {
    if (--count <= 0) {
        delete this;
    }
}

Pointer& Array::index(const Pointer &index) {
    if (index.isNumber()) {
        return indexNum(index.getNumber());
    } else {
        simplex::ex_array_out_of_bounds(index);
    }
}

Pointer& Array::indexNum(Double index) {
    long long i = simplex::round(index);
    if (i >= 0 && i < size) {
        return pointers[i];
    } else {
        simplex::ex_array_out_of_bounds(index);
    }
}
