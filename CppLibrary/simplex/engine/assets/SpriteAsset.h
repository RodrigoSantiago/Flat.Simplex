//
// Created by Rodrigo on 01/09/2025.
//

#ifndef SIMPLEX_SPRITEASSET_H
#define SIMPLEX_SPRITEASSET_H

#include "../GameAsset.h"
#include "SpriteAnim.h"

class AssetEntry;

class SpriteAsset : public GameAsset {
public:
    int32 width;
    int32 height;
    int32 centerX;
    int32 centerY;
    int32 offX;
    int32 offY;
    int32 tileWidth;
    int32 tileHeight;
    int32 splitMode;
    std::vector<SpriteAnim> animations;
    std::unordered_map<std::string, int32> animationID;

    SpriteAsset();
    ~SpriteAsset() override;
    static SpriteAsset* readAsset(AssetEntry* entry);
    int32 findAnimationByName(const std::string& name);
};


#endif //SIMPLEX_SPRITEASSET_H
