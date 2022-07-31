//
// Created by Rodrigo on 29/07/2022.
//

#include "Value.h"
#include "../Simplex.h"

Value Value::undefined;

Value::~Value() {

}

VariableType::VariableType Value::getType() const {
    return VariableType::Undefined;
}

Pointer Value::getTypeName() const {
    return Pointer(new String(VariableType::str(getType())));
}

Pointer Value::getString() const {
    return s("undefined");
}

Double Value::getNumber() const {
    return make_nan().number;
}

Double Value::getBool() {
    return false;
}

DoublePointer Value::getPointer() {
    return make_ptr(this);
}

Value *Value::reference() {
    return this;
}

void Value::deference() {

}

Pointer& Value::index(const Pointer &index) {

    throw simplex::ex_invalid_assessor(index);
}

Pointer& Value::indexNum(Double index) {

    throw simplex::ex_invalid_assessor(index);
}

Pointer& Value::indexStr(const String& index) {

    throw simplex::ex_invalid_assessor(Pointer(new String(index)));
}

Pointer& Value::indexGrid(const Pointer &x, const Pointer &y) {

    throw simplex::ex_invalid_assessor(x + s(", ") + y);
}

Pointer& Value::getField(long hashName) {

    throw simplex::ex_missing_field(HashName::getName(hashName), getTypeName());
}

Pointer& Value::setField(long hashName, const Pointer& value) {

    throw simplex::ex_invalid_field(HashName::getName(hashName), getTypeName());
}

Pointer &Value::refField(long hashName) {

    throw simplex::ex_missing_field(HashName::getName(hashName), getTypeName());
}

Pointer Value::execute(const Pointer& args) {

    throw simplex::ex_invalid_function();
}

Pointer& Value::setIndex(const Pointer &index, const Pointer &value) {
    switch (value.getType()) {
        case VariableType::Array:
        case VariableType::Map:
        case VariableType::Grid:
            throw simplex::ex_container_value(value);
    }
    return this->index(index) = value;
}

Pointer &Value::setIndexNum(Double index, const Pointer &value) {
    switch (value.getType()) {
        case VariableType::Array:
        case VariableType::Map:
        case VariableType::Grid:
            throw simplex::ex_container_value(value);
    }
    return this->indexNum(index) = value;
}

Pointer &Value::setIndexStr(const String& index, const Pointer &value) {
    switch (value.getType()) {
        case VariableType::Array:
        case VariableType::Map:
        case VariableType::Grid:
            throw simplex::ex_container_value(value);
    }
    return this->indexStr(index) = value;
}

Pointer &Value::setIndexGrid(const Pointer &x, const Pointer &y, const Pointer &value) {
    switch (value.getType()) {
        case VariableType::Array:
        case VariableType::Map:
        case VariableType::Grid:
            throw simplex::ex_container_value(value);
    }
    return this->indexGrid(x, y) = value;
}
