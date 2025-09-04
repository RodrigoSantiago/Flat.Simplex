//
// Created by Rodrigo on 03/09/2025.
//

#ifndef SIMPLEX_GAMESETTINGS_H
#define SIMPLEX_GAMESETTINGS_H

#include "../Base.h"

class GameSettings {
public:
    int64 startSceneHash;
    int32 fpsMax;
    bool vsync;
    int32 aspect;
    float aspectX;
    float aspectY;
    int32 orientation;
    int32 scaleMode;
    int32 scaleFilter;

    bool fullscreen;
    bool resizeable;
    bool pause;
};


#endif //SIMPLEX_GAMESETTINGS_H
