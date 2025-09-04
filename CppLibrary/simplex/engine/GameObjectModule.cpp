//
// Created by Rodrigo on 02/09/2025.
//

#include "GameObjectModule.h"
#include "GameRender.h"
#include "GameObject.h"

void GameObjectModule::syncPhysics() {

}

void GameObjectModule::render() {
    if (sprite != nullptr) {
        GameRender::drawSprite(sprite, x, y, sprite->width, sprite->height, spriteAnim, 0, nullptr, -1, 0, 0);
    }
}