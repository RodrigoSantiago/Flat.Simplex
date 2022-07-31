//
// Created by Rodrigo on 30/07/2022.
//

#include "Object.h"
#include "../Simplex.h"
#include <unordered_map>

#define MAP (*static_cast<std::unordered_map<long, Pointer>*>(variables))

Object::Object() : Asset(),
    _depth(MAP[HashName::_depth] = Pointer(1.0_d)) {

}

void Object::start() {

}

void Object::update() {

}

void Object::destroy() {

}

void Object::render() {

}
