//
// Created by Rodrigo on 30/07/2022.
//

#include "Map.h"
#include "../Simplex.h"
#include <unordered_map>
#include <string>

#define MAPS (*static_cast<std::unordered_map<std::string, Pointer>*>(mapS))
#define MAPD (*static_cast<std::unordered_map<long long, Pointer>*>(mapD))

Map::Map() : count(0) {
    mapS = new std::unordered_map<std::string, Pointer>();
    mapD = new std::unordered_map<long long, Pointer>();
}

Map::Map(long size, const MapInit *initList) : count(0) {
    for (long long i = 0; i < size; ++i) {
        if (!initList[i].index.isNumber() && !initList[i].index.isString()) {
            simplex::ex_invalid_assessor(initList[i].index);
        }
        switch (initList[i].value.getType()) {
            case VariableType::Array:
            case VariableType::Grid:
            case VariableType::Map:
                simplex::ex_container_value(initList[i].value);
        }
    }

    mapS = new std::unordered_map<std::string, Pointer>();
    mapD = new std::unordered_map<long long, Pointer>();
    for (int i = 0; i < size; ++i) {
        index(initList[i].index) = initList[i].value;
    }
}

Map::~Map() {
    delete static_cast<std::unordered_map<std::string, Pointer>*>(mapS);
    delete static_cast<std::unordered_map<long long, Pointer>*>(mapD);
}

VariableType::VariableType Map::getType() const {
    return VariableType::Map;
}

Pointer Map::getString() const {
    return s("Map");
}

Double Map::getBool() {
    return b(!MAPS.empty() || !MAPD.empty());
}

Value *Map::reference() {
    count++;
    return this;
}

void Map::deference() {
    if (--count <= 0) {
        delete this;
    }
}

Pointer& Map::index(const Pointer &index) {
    auto type = index.getType();
    if (type == VariableType::Number) {
        return indexNum(index.getNumber());
    } else if (type == VariableType::String) {
        return indexStr(AS_STRING(index.getString()));
    }
    return Value::index(index);
}

Pointer& Map::indexNum(Double index) {
    long long key = simplex::round(index);
    auto find = MAPD.find(key);
    if (find == MAPD.end()) {
        return MAPD[key] = Pointer();
    } else {
        return find->second;
    }
}

Pointer& Map::indexStr(const String& index) {
    auto key = std::string(index.chars);
    auto find = MAPS.find(key);
    if (find == MAPS.end()) {
        return MAPS[key] = Pointer();
    } else {
        return find->second;
    }
}