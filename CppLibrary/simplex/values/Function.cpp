//
// Created by Rodrigo on 31/07/2022.
//

#include "Function.h"
#include "../Simplex.h"

Function::Function() : function(), args(0) {

}

Function::Function(const Function &copy) : function(copy.function), args(copy.args) {

}

Function::Function(long args, Pointer (*function)(const Pointer&, const Pointer&)) : function(function), args(args) {

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

Pointer Function::execute(const Pointer& self, const Pointer &args) {
    Arguments* ar = static_cast<Arguments*>(AS_OBJECT(args.data));
    ar->reserve(this->args);
    return function ? function(self, args) : Pointer();
}