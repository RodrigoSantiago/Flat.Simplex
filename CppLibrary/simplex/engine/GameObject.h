//
// Created by Rodrigo on 01/09/2025.
//

#ifndef SIMPLEX_GAMEOBJECT_H
#define SIMPLEX_GAMEOBJECT_H

#include "../Base.h"
#include "GameObjectModule.h"

class GameInstanceData;

class GameObject {
public:
    int64 id;
    bool destroyed;
    std::vector<GameObjectModule> modules;

    explicit GameObject(int64 id);

    GameObjectModule* findModuleById(int64 hash);
    void syncPhysics();

    virtual void build(const GameInstanceData& instanceData);
    virtual void onCreate();
    virtual void onDestroy();
    virtual void onStep();
    virtual void onRender();
};


#endif //SIMPLEX_GAMEOBJECT_H
