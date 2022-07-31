//
// Created by Rodrigo on 29/07/2022.
//

#include "Pointer.h"
#include "../Simplex.h"

Pointer::Pointer() : data(make_nan()) {

}

Pointer::Pointer(Value *value) : data(value != nullptr ? make_ptr(value->reference()) : make_nan()) {

}

Pointer::Pointer(Struct *value) : data(value != nullptr ? make_ptr(value) : make_nan())  {

}

Pointer::Pointer(const Pointer &copy) : data(IS_OBJECT(copy.data) ? make_ptr(AS_OBJECT(copy.data)->reference()) : copy.data) {

}

Pointer::Pointer(Double d) : data(make_num(d)) {

}

Pointer::Pointer(const Chars &str) : Pointer(new String(str)) {

}


Value *Pointer::operator->() const {
    return IS_OBJECT(data) ? AS_OBJECT(data) : &Value::undefined;
}

Pointer::~Pointer() {
    if (IS_OBJECT(data)) {
        AS_OBJECT(data)->deference();
    }
}

Pointer &Pointer::operator=(Value *value) {
    set(value);
    return *this;
}

Pointer &Pointer::operator=(const Pointer &copy) {
    if (&copy == this) return *this;

    if (IS_OBJECT(data)) {
        AS_OBJECT(data)->deference();
    }
    data = IS_OBJECT(copy.data) ? make_ptr(AS_OBJECT(copy.data)->reference()) : copy.data;
    return *this;
}

Pointer &Pointer::operator=(Double d) {
    if (IS_OBJECT(data)) {
        AS_OBJECT(data)->deference();
    }
    data = make_num(d);
    return *this;
}

Pointer &Pointer::operator=(const Chars &str) {
    set(new String(str));
    return *this;
}

void Pointer::set(Value *value) {
    if (data.bits == make_ptr(value).bits) {
        return;
    }

    if (IS_OBJECT(data)) {
        AS_OBJECT(data)->deference();
    }
    data = value != nullptr ? make_ptr(value->reference()) : make_nan();
}

VariableType::VariableType Pointer::getType() const {
    return IS_NUMBER(data) ? VariableType::Number : IS_NAN(data) ? VariableType::Undefined : AS_OBJECT(data)->getType();
}

Pointer Pointer::getTypeName() const {
    return IS_NUMBER(data) ? s("Number") : IS_NAN(data) ? s("Undefined") : AS_OBJECT(data)->getTypeName();
}

Double Pointer::getNumber() const {
    return data.number;
}

Pointer Pointer::getString() const {
    if (IS_OBJECT(data)) {
        if (isString()) {
            return *this;
        } else {
            return AS_OBJECT(data)->getString();
        }
    } else {
        return Pointer(new String(simplex::string(data.number)));
    }
}

Double Pointer::getBool() const {
    return IS_OBJECT(data) ? AS_OBJECT(data)->getBool() : data.number >= 0.5_d;
}

DoublePointer Pointer::getPointer() const {
    return IS_OBJECT(data) ? AS_OBJECT(data)->getPointer() : make_nan();
}

bool Pointer::isUndefined() const {
    return IS_NAN(data);
}

bool Pointer::isNumber() const {
    return IS_NUMBER(data);
}

bool Pointer::isString() const {
    return IS_OBJECT(data) && AS_OBJECT(data)->getType() == VariableType::String;
}

Pointer& Pointer::operator++(){
    *this = isNumber() ? *this + 1.0_d : make_nan().number;
    return *this;
}

Pointer Pointer::operator++(int) {
    Pointer temp = *this;
    *this = isNumber() ? *this + 1.0_d : make_nan().number;
    return temp;
}

Pointer& Pointer::operator--(){
    *this = isNumber() ? *this - 1.0_d : make_nan().number;
    return *this;
}

Pointer Pointer::operator--(int) {
    Pointer temp = *this;
    *this = isNumber() ? *this - 1.0_d : make_nan().number;
    return temp;
}

Pointer &Pointer::operator+=(const Pointer &copy) {
    return *this = *this + copy;
}

Pointer &Pointer::operator+=(Double d) {
    return *this = *this + d;
}

Pointer &Pointer::operator+=(const Chars &str) {
    return *this = *this + str;
}

Pointer &Pointer::operator-=(const Pointer &copy) {
    return *this = *this - copy;
}

Pointer &Pointer::operator-=(Double d) {
    return *this = *this - d;
}

Pointer &Pointer::operator-=(const Chars &str) {
    return *this = *this - str;
}

Pointer &Pointer::operator*=(const Pointer &copy) {
    return *this = *this * copy;
}

Pointer &Pointer::operator*=(Double d) {
    return *this = *this * d;
}

Pointer &Pointer::operator*=(const Chars &str) {
    return *this = *this * str;
}

Pointer &Pointer::operator/=(const Pointer &copy) {
    return *this = *this / copy;
}

Pointer &Pointer::operator/=(Double d) {
    return *this = *this / d;
}

Pointer &Pointer::operator/=(const Chars &str) {
    return *this = *this / str;
}

Pointer &Pointer::operator%=(const Pointer &copy) {
    return *this = *this % copy;
}

Pointer &Pointer::operator%=(Double d) {
    return *this = *this % d;
}

Pointer &Pointer::operator%=(const Chars &str) {
    return *this = *this % str;
}

Pointer Pointer::operator-() const {
    return isNumber() ? Pointer(-getNumber()) : Pointer();
}

Pointer Pointer::operator+() const {
    return isNumber() ? *this : Pointer();
}

Pointer Pointer::operator!() const {
    return isNumber() ? Pointer(!getNumber()) : Pointer();
}

Pointer Pointer::operator~() const {
    return isNumber() ? Pointer(~getNumber()) : Pointer();
}

Pointer &Pointer::operator&=(const Pointer &copy) {
    return *this = *this & copy;
}

Pointer &Pointer::operator&=(Double d) {
    return *this = *this & d;
}

Pointer &Pointer::operator&=(const Chars &str) {
    return *this = *this & str;
}

Pointer &Pointer::operator|=(const Pointer &copy) {
    return *this = *this | copy;
}

Pointer &Pointer::operator|=(Double d) {
    return *this = *this | d;
}

Pointer &Pointer::operator|=(const Chars &str) {
    return *this = *this | str;
}

Pointer &Pointer::operator^=(const Pointer &copy) {
    return *this = *this ^ copy;
}

Pointer &Pointer::operator^=(Double d) {
    return *this = *this ^ d;
}

Pointer &Pointer::operator^=(const Chars &str) {
    return *this = *this ^ str;
}

Pointer &Pointer::operator>>=(const Pointer &copy) {
    return *this = *this >> copy;
}

Pointer &Pointer::operator>>=(Double d) {
    return *this = *this >> d;
}

Pointer &Pointer::operator>>=(const Chars &str) {
    return *this = *this >> str;
}

Pointer &Pointer::operator<<=(const Pointer &copy) {
    return *this = *this << copy;
}

Pointer &Pointer::operator<<=(Double d) {
    return *this = *this << d;
}

Pointer &Pointer::operator<<=(const Chars &str) {
    return *this = *this << str;
}

Pointer::operator bool() const {
    return b(getBool());
}