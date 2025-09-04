//
// Created by Rodrigo on 03/09/2025.
//

#include "ObjectAsset.h"
#include "ObjectModule.h"
#include "GameResources.h"
#include "AssetEntry.h"
#include "../Parse.h"

ObjectAsset::ObjectAsset() : GameAsset(OBJECT) {

}

inline std::string read(const std::vector<pair>& pairs, int32& i) {
    if (i >= pairs.size()) {
        std::cout << "FAIL TO LOAD. UNEXPECTED EOF" << std::endl;
        return "";
    }
    return pairs[i++].right;
}

ObjectAsset *ObjectAsset::readAsset(AssetEntry *entry) {
    auto pairs = GameResources::readPairs(GameResources::getFileName(entry));

    int32 i = 0;
    ObjectAsset* asset = new ObjectAsset();
    ObjectAsset& obj = *asset;
    obj.hashName = entry->hash;
    obj.className = pairs[i++].right;

    int32 modules_count = Parse::Int32(read(pairs, i));
    obj.modules.resize(modules_count);

    for (int c = 0; c < modules_count; ++c) {
        ObjectModule& module = obj.modules[c];
        module.name = read(pairs, i);
        module.spriteHash = Parse::Int64(read(pairs, i));
        module.spriteAnim = read(pairs, i);
        module.hash = Parse::Int64(read(pairs, i));
        module.ownerModuleHash = Parse::Int64(read(pairs, i));
        module.core = Parse::Bool(read(pairs, i));
        module.x = Parse::Float(read(pairs, i));
        module.y = Parse::Float(read(pairs, i));
        module.scaleX = Parse::Float(read(pairs, i));
        module.scaleY = Parse::Float(read(pairs, i));
        module.rotation = Parse::Float(read(pairs, i));
        module.order = Parse::Float(read(pairs, i));
        module.type = Parse::Int32(read(pairs, i));
        module.dynamic = Parse::Bool(read(pairs, i));
        module.solid = Parse::Bool(read(pairs, i));
        module.mass = Parse::Float(read(pairs, i));
        module.drag = Parse::Float(read(pairs, i));
        module.rotDrag = Parse::Float(read(pairs, i));
        module.lockRot = Parse::Bool(read(pairs, i));
        module.offX = Parse::Float(read(pairs, i));
        module.offY = Parse::Float(read(pairs, i));
        module.shapeType = Parse::Int32(read(pairs, i));
        module.radius = Parse::Float(read(pairs, i));
        module.width = Parse::Float(read(pairs, i));
        module.height = Parse::Float(read(pairs, i));
        module.gravity = Parse::Float(read(pairs, i));
        module.friction = Parse::Float(read(pairs, i));
        module.bounce = Parse::Float(read(pairs, i));
    }
    return asset;
}
