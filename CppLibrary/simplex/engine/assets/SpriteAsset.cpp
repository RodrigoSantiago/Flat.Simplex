//
// Created by Rodrigo on 01/09/2025.
//

#include "SpriteAsset.h"
#include "AssetEntry.h"
#include "SpriteAnim.h"
#include "GameResources.h"
#include "../GameEngine.h"
#include "../Parse.h"
#include "Assets.h"
#include "Image.h"

SpriteAsset::SpriteAsset() : GameAsset(SPRITE) {

}

SpriteAsset::~SpriteAsset() {
    for (int c = 0; c < animations.size(); ++c) {
        SpriteAnim &anim = animations[c];
        delete anim.image;
    }
}


inline std::string read(const std::vector<pair>& pairs, int32& i) {
    if (i >= pairs.size()) {
        std::cout << "FAIL TO LOAD. UNEXPECTED EOF" << std::endl;
        return "";
    }
    return pairs[i++].right;
}

SpriteAsset *SpriteAsset::readAsset(AssetEntry *entry) {
    auto pairs = GameResources::readPairs(GameResources::getFileName(entry));

    int32 i = 0;
    SpriteAsset* asset = new SpriteAsset();
    SpriteAsset& scn = *asset;
    scn.hashName = entry->hash;
    scn.width = Parse::Int32(read(pairs, i));
    scn.height = Parse::Int32(read(pairs, i));
    scn.centerX = Parse::Int32(read(pairs, i));
    scn.centerY = Parse::Int32(read(pairs, i));
    scn.offX = Parse::Int32(read(pairs, i));
    scn.offY = Parse::Int32(read(pairs, i));
    scn.tileWidth = Parse::Int32(read(pairs, i));
    scn.tileHeight = Parse::Int32(read(pairs, i));
    scn.splitMode = Parse::Int32(read(pairs, i));

    int anim_count = Parse::Int32(read(pairs, i));
    scn.animations.resize(anim_count);

    for (int c = 0; c < anim_count; ++c) {
        SpriteAnim &anim = scn.animations[c];
        anim.name = read(pairs, i);
        anim.size = Parse::Int32(read(pairs, i));
        anim.atlas = read(pairs, i);
        anim.atlas_w = Parse::Int32(read(pairs, i));
        anim.atlas_h = Parse::Int32(read(pairs, i));
        anim.image = GameResources::readImage(GameResources::getFileName(anim.atlas));

        scn.animationID[anim.name] = c;
    }
    return asset;
}

int32 SpriteAsset::findAnimationByName(const std::string& name) {
    auto it = animationID.find(name);
    if (it != animationID.end()) {
        return it->second;
    }
    return 0; // Default
}