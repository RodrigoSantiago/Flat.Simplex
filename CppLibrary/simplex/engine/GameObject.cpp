//
// Created by Rodrigo on 01/09/2025.
//

#include "GameObject.h"
#include "GameRender.h"
#include "GameObjectModule.h"
#include "GameInstanceData.h"
#include "assets/GameResources.h"
#include "assets/Assets.h"

GameObject::GameObject(int64 id) :
    id(id),
    destroyed(false),
    modules() {
}

void GameObject::build(const GameInstanceData& instanceData) {
    modules.resize(instanceData.objAsset->modules.size());
    for (int32 i = 0; i < modules.size(); i++) {
        ObjectModule module = instanceData.objAsset->modules[i];
        GameObjectModule& gModule = modules[i];
        gModule.gameObject = this;
        gModule.hash = module.hash;

        gModule.spriteHash = module.spriteHash;
        gModule.sprite = GameResources::loadSprite(module.spriteHash);
        if (gModule.sprite == nullptr) {
            gModule.spritePtr = Pointer();
            gModule.spriteAnim = 0;
        } else {
            gModule.spritePtr = Pointer(gModule.sprite->reference);
            gModule.spriteAnim = gModule.sprite->findAnimationByName(module.spriteAnim);
        }
        gModule.ownerModuleHash = module.ownerModuleHash;

        gModule.core = module.core;
        gModule.x = module.x;
        gModule.y = module.y;
        gModule.scaleX = module.scaleX;
        gModule.scaleY = module.scaleY;
        gModule.rotation = module.rotation;
        gModule.order = module.order;

        gModule.type = module.type;
        gModule.dynamic = module.dynamic;
        gModule.solid = module.solid;
        gModule.mass = module.mass;
        gModule.drag = module.drag;
        gModule.rotDrag = module.rotDrag;
        gModule.lockRot = module.lockRot;
        gModule.offX = module.offX;
        gModule.offY = module.offY;
        gModule.shapeType = module.shapeType;
        gModule.radius = module.radius;
        gModule.width = module.width;
        gModule.height = module.height;
        gModule.gravity = module.gravity;
        gModule.friction = module.friction;
        gModule.bounce = module.bounce;

        gModule.x += instanceData.x;
        gModule.y += instanceData.y;
    }

    for (int32 i = 0; i < modules.size(); i++) {
        GameObjectModule &gModule = modules[i];
        gModule.owner = findModuleById(gModule.ownerModuleHash);
    }
}

void GameObject::syncPhysics() {
    for(auto& module : modules) {
        module.syncPhysics();
    }
}

void GameObject::onCreate() {

}

void GameObject::onDestroy() {

}

void GameObject::onStep() {

}

void GameObject::onRender() {
    for(auto& module : modules) {
        module.render();
    }
}

GameObjectModule* GameObject::findModuleById(int64 hash) {
    for (int32 i = 0; i < modules.size(); i++) {
        if (modules[i].hash == hash) return &modules[i];
    }
    return nullptr;
}
