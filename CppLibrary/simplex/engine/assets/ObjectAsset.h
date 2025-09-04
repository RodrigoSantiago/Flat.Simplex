//
// Created by Rodrigo on 03/09/2025.
//

#ifndef SIMPLEX_OBJECTASSET_H
#define SIMPLEX_OBJECTASSET_H

#include "../GameAsset.h"
#include "ObjectModule.h"

class AssetEntry;

class ObjectAsset : public GameAsset {
public:
    std::string className;
    std::vector<ObjectModule> modules;

    ObjectAsset();
    static ObjectAsset* readAsset(AssetEntry* entry);
};


#endif //SIMPLEX_OBJECTASSET_H
