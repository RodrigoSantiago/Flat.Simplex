//
// Created by Rodrigo on 03/09/2025.
//

#ifndef SIMPLEX_ASSETENTRY_H
#define SIMPLEX_ASSETENTRY_H

#include "../../Base.h"
#include "../GameAsset.h"

class AssetEntry {
public:
    int64 hash;
    std::string name;
    std::string path;
    GameAsset::Type type;
};


#endif //SIMPLEX_ASSETENTRY_H
