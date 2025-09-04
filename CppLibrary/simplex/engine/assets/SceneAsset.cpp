//
// Created by Rodrigo on 01/09/2025.
//

#include "SceneAsset.h"
#include "GameResources.h"
#include "AssetEntry.h"
#include "../GameEngine.h"
#include "../Parse.h"
#include "Assets.h"
#include "../GameInstanceData.h"

SceneAsset::SceneAsset() : GameAsset(SCENE) {

}

inline std::string read(const std::vector<pair>& pairs, int32& i) {
    if (i >= pairs.size()) {
        std::cout << "FAIL TO LOAD. UNEXPECTED EOF" << std::endl;
        return "";
    }
    return pairs[i++].right;
}

SceneAsset *SceneAsset::readAsset(AssetEntry *entry) {
    auto pairs = GameResources::readPairs(GameResources::getFileName(entry));

    int32 i = 0;
    SceneAsset* asset = new SceneAsset();
    SceneAsset& scn = *asset;
    scn.hashName = entry->hash;
    scn.width = Parse::Int32(read(pairs, i));
    scn.height = Parse::Int32(read(pairs, i));
    scn.gridWidth = Parse::Int32(read(pairs, i));
    scn.gridHeight = Parse::Int32(read(pairs, i));
    scn.resetPersistent = Parse::Bool(read(pairs, i));
    scn.resetVariables = Parse::Bool(read(pairs, i));
    scn.nextSceneHash = Parse::Int64(read(pairs, i));

    int cameras_count = Parse::Int32(read(pairs, i));
    scn.cameras.resize(cameras_count);

    for (int c = 0; c < cameras_count; ++c) {
        SceneCamera& cam = scn.cameras[c];
        cam.enabled = Parse::Bool(read(pairs, i));
        cam.x = Parse::Float(read(pairs, i));
        cam.y = Parse::Float(read(pairs, i));
        cam.width = Parse::Float(read(pairs, i));
        cam.height = Parse::Float(read(pairs, i));
        cam.screenX = Parse::Float(read(pairs, i));
        cam.screenY = Parse::Float(read(pairs, i));
        cam.screenWidth = Parse::Float(read(pairs, i));
        cam.screenHeight = Parse::Float(read(pairs, i));
        cam.scaleMode = Parse::Int32(read(pairs, i));
        cam.followObjectHash = Parse::Int64(read(pairs, i));
        cam.followMode = Parse::Int32(read(pairs, i));
        cam.followBorder = Parse::Float(read(pairs, i));
        cam.limitToSceneSize = Parse::Bool(read(pairs, i));
    }

    int items_count = Parse::Int32(read(pairs, i));
    scn.items.resize(items_count);

    for (int it = 0; it < items_count; ++it) {
        SceneItem& item = scn.items[it];
        item.hash = Parse::Int64(read(pairs, i));
        item.name = read(pairs, i);
        item.type = parseSceneObjectType(read(pairs, i));
        item.assetHash = Parse::Int64(read(pairs, i));
        item.animName = read(pairs, i);
        item.animationSpeed = Parse::Float(read(pairs, i));
        item.persistent = Parse::Bool(read(pairs, i));
        item.x = Parse::Float(read(pairs, i));
        item.y = Parse::Float(read(pairs, i));
        item.scaleX = Parse::Float(read(pairs, i));
        item.scaleY = Parse::Float(read(pairs, i));
        item.rotation = Parse::Float(read(pairs, i));
        item.depth = Parse::Float(read(pairs, i));
        item.collision = Parse::Bool(read(pairs, i));
        item.shapeType = Parse::Int32(read(pairs, i));
        item.solid = Parse::Bool(read(pairs, i));
        item.width = Parse::Float(read(pairs, i));
        item.height = Parse::Float(read(pairs, i));
        item.radius = Parse::Float(read(pairs, i));
        item.friction = Parse::Float(read(pairs, i));
        item.bounce = Parse::Float(read(pairs, i));
        item.offX = Parse::Float(read(pairs, i));
        item.offY = Parse::Float(read(pairs, i));
        item.targetCamera = Parse::Int32(read(pairs, i));
        item.scaleMode = Parse::Int32(read(pairs, i));
        item.horSpd = Parse::Float(read(pairs, i));
        item.verSpd = Parse::Float(read(pairs, i));
        item.horRatio = Parse::Float(read(pairs, i));
        item.verRatio = Parse::Float(read(pairs, i));
        int32 variables_count = Parse::Int32(read(pairs, i));
        for (int j = 0; j < variables_count; ++j) {
            std::string variable_hash = read(pairs, i);
            std::string variable_name = read(pairs, i);
            std::string variable_value = read(pairs, i);
        }
        int32 tiles_count = Parse::Int32(read(pairs, i));
        for (int j = 0; j < tiles_count; ++j) {
            std::string tile_srcX = read(pairs, i);
            std::string tile_srcY = read(pairs, i);
            std::string tile_posX = read(pairs, i);
            std::string tile_posy = read(pairs, i);
        }
    }

    std::cout << i << ", " << pairs.size() << std::endl;

    return asset;
}

void SceneAsset::instantiateItems() {
    GameInstanceData data = {};
    for (int i = 0; i < items.size(); ++i) {
        SceneItem& item = items[i];
        if (item.type == SceneItem::OBJECT) {
            ObjectAsset* obj = GameResources::loadObject(item.assetHash);
            data.x = item.x;
            data.y = item.y;
            data.objAsset = obj;
            GameEngine::instantiate(&data);
        }
    }
}

void SceneAsset::setupCameras() {

}
