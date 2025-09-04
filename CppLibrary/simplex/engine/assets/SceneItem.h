//
// Created by Rodrigo on 03/09/2025.
//

#ifndef SIMPLEX_SCENEITEM_H
#define SIMPLEX_SCENEITEM_H

#include "../../Base.h"

class SceneItem {
public:
    enum Type {
        OBJECT, DUMMY, IMAGE, TILESET
    };

    int64 hash;
    std::string name;
    Type type;

    // Base
    int64 assetHash;
    std::string animName;
    float animationSpeed;
    bool persistent;
    float x;
    float y;
    float scaleX;
    float scaleY;
    float rotation;
    float depth;

    // Physics
    bool collision;
    int32 shapeType;
    bool solid;
    float width;
    float height;
    float radius;
    float friction;
    float bounce;
    float offX;
    float offY;

    // Image
    int32 targetCamera;
    int32 scaleMode;
    float horSpd;
    float verSpd;
    float horRatio;
    float verRatio;
};

inline SceneItem::Type parseSceneObjectType(const std::string& str) {
    if (str == "OBJECT") return SceneItem::OBJECT;
    if (str == "DUMMY") return SceneItem::DUMMY;
    if (str == "TILESET") return SceneItem::TILESET;
    return SceneItem::IMAGE;
}



#endif //SIMPLEX_SCENEITEM_H
