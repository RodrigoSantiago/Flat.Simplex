//
// Created by Rodrigo on 03/09/2025.
//

#ifndef SIMPLEX_SCENECAMERA_H
#define SIMPLEX_SCENECAMERA_H

#include "../../Base.h"

class SceneCamera {
public:
    bool enabled;
    float x;
    float y;
    float width;
    float height;
    float screenX;
    float screenY;
    float screenWidth;
    float screenHeight;
    int32 scaleMode;
    int64 followObjectHash;
    int32 followMode;
    float followBorder;
    bool limitToSceneSize;
};


#endif //SIMPLEX_SCENECAMERA_H
