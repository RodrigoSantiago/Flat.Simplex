//
// Created by Rodrigo on 30/07/2022.
//

#include "Asset.h"
#include "../Simplex.h"
#include <unordered_map>

#define MAP (*static_cast<std::unordered_map<long, Pointer>*>(variables))

Pointer& Asset::getField(long hashName) {
    auto find = MAP.find(hashName);
    if (find == MAP.end()) {

        throw simplex::ex_missing_field(HashName::getName(hashName), getTypeName());
    } else {
        return find->second;
    }
}

Pointer& Asset::setField(long hashName, const Pointer& value) {
    auto find = MAP.find(hashName);
    if (find == MAP.end()) {
        return MAP[hashName] = value;
    } else {
        return find->second = value;
    }
}

Pointer& Asset::refField(long hashName) {
    auto find = MAP.find(hashName);
    if (find == MAP.end()) {

        throw simplex::ex_missing_field(HashName::getName(hashName), getTypeName());
    } else {
        return find->second;
    }
}

Asset::~Asset() {
    if (reference != nullptr) {
        reference->asset = nullptr;
    }
}

Pointer Asset::getTypeName() {
    return s("Asset");
}
