//
// Created by Rodrigo on 04/09/2025.
//

#ifndef SIMPLEX_OBJECTMODULE_H
#define SIMPLEX_OBJECTMODULE_H

#include "../../Base.h"

class ObjectModule {
public:
    std::string name;
    int64 spriteHash;
    std::string spriteAnim;
    int64 hash;
    int64 ownerModuleHash;

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
};


#endif //SIMPLEX_OBJECTMODULE_H
