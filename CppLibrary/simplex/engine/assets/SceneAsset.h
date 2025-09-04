//
// Created by Rodrigo on 01/09/2025.
//

#ifndef SIMPLEX_SCENEASSET_H
#define SIMPLEX_SCENEASSET_H

#include "../GameAsset.h"
#include "SceneCamera.h"
#include "SceneItem.h"

class AssetEntry;

class SceneAsset : public GameAsset {
public:
    int width;
    int height;
    int gridWidth;
    int gridHeight;
    bool resetPersistent;
    bool resetVariables;
    int64 nextSceneHash;
    std::vector<SceneCamera> cameras;
    std::vector<SceneItem> items;

    SceneAsset();
    static SceneAsset* readAsset(AssetEntry* entry);
    void instantiateItems();
    void setupCameras();
};


#endif //SIMPLEX_SCENEASSET_H
