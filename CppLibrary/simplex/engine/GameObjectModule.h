//
// Created by Rodrigo on 02/09/2025.
//

#ifndef SIMPLEX_GAMEOBJECTMODULE_H
#define SIMPLEX_GAMEOBJECTMODULE_H

#include "../Base.h"
#include "../values/Pointer.h"

class GameObject;
class SpriteAsset;

class GameObjectModule {
public:
    GameObject* gameObject;
    GameObjectModule* owner;

    int64 hash;
    int64 ownerModuleHash;

    Pointer spritePtr;
    SpriteAsset* sprite;
    int64 spriteHash;
    int32 spriteAnim;

    bool core;
    float x;
    float y;
    float scaleX;
    float scaleY;
    float rotation;
    float order;

    int32 type;
    bool dynamic;
    bool solid;
    float mass;
    float drag;
    float rotDrag;
    bool lockRot;
    float offX;
    float offY;
    int32 shapeType;
    float radius;
    float width;
    float height;
    float gravity;
    float friction;
    float bounce;

    void syncPhysics();
    void render();
};


#endif //SIMPLEX_GAMEOBJECTMODULE_H
