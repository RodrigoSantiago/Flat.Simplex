//
// Created by Rodrigo on 31/07/2022.
//

#include "Function.h"
#include "../Simplex.h"

Function::Function() : function() {

}

Function::Function(const Function &copy) : function(copy.function) {

}

Function::Function(Pointer (*function)(Pointer)) : function(function) {

}

Function::~Function() {

}

VariableType::VariableType Function::getType() const {
    return VariableType::Function;
}

Pointer Function::getString() const {
    return s("Function");
}

Double Function::getBool() {
    return function ? 1.0_d : 0.0_d;
}

Value *Function::reference() {
    return new Function(*this);
}

void Function::deference() {
    delete this;
}

Pointer Function::execute(const Pointer &args) {

    return function ? function(args) : Pointer();
}