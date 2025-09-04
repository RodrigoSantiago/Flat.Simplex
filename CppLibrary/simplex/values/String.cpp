//
// Created by Rodrigo on 29/07/2022.
//

#include "String.h"
#include "../Simplex.h"
#include <cstring>

String::String() : length(0), count(0) {
    chars = new char[length + 1];
    chars[length] = '\0';

}

String::String(const Chars& copy) : count(0){
    length = strlen(copy.chars);
    if (length > 0) {
        chars = new char[length + 1];
        memcpy(chars, copy.chars, length);
        chars[length] = '\0';
    } else {
        chars = nullptr;
    }
}

String::String(const String &copy) : count(0) {
    length = copy.length;
    if (length > 0) {
        chars = new char[length + 1];
        memcpy(chars, copy.chars, length);
        chars[length] = '\0';
    } else {
        chars = nullptr;
    }
}

String::~String() {
    delete chars;
}

VariableType::VariableType String::getType() const {
    return VariableType::String;
}

Pointer String::getString() const {
    return Pointer();
}

Double String::getNumber() const {
    return Value::getNumber();
}

Double String::getBool() {
    return chars != nullptr ? 1.0_d : 0.0_d;
}

Value *String::reference() {
    count++;
    return this;
}

void String::deference() {
    if (--count <= 0) {
        delete this;
    }
}

String::String(const String &a, const String &b) : count(0) {
    long al = a.length;
    long bl = b.length;
    length = al + bl;
    if (length > 0) {
        chars = new char [length + 1];
        memcpy(chars, a.chars, al);
        memcpy(chars + al, b.chars, bl);
        chars[length] = '\0';
    } else {
        chars = nullptr;
    }
}

String::String(const String &a, const Chars &b) : count(0) {
    long al = a.length;
    long bl = strlen(b.chars);
    length = al + bl;
    if (length > 0) {
        chars = new char [length + 1];
        memcpy(chars, a.chars, al);
        memcpy(chars + al, b.chars, bl);
        chars[length] = '\0';
    } else {
        chars = nullptr;
    }
}

String::String(const Chars &a, const String &b) : count(0) {
    long al = strlen(a.chars);
    long bl = b.length;
    length = al + bl;
    if (length > 0) {
        chars = new char [length + 1];
        memcpy(chars, a.chars, al);
        memcpy(chars + al, b.chars, bl);
        chars[length] = '\0';
    } else {
        chars = nullptr;
    }
}

String::String(const Chars &a, const Chars &b) : count(0) {
    long al = strlen(a.chars);
    long bl = strlen(b.chars);
    length = al + bl;
    if (length > 0) {
        chars = new char [length + 1];
        memcpy(chars, a.chars, al);
        memcpy(chars + al, b.chars, bl);
        chars[length] = '\0';
    } else {
        chars = nullptr;
    }
}
