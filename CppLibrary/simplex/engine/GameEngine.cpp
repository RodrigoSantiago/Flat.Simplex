//
// Created by Rodrigo on 01/09/2025.
//

#include "GameEngine.h"
#include "GameObject.h"
#include "GameRender.h"
#include "GameSettings.h"
#include "assets/GameResources.h"
#include "assets/SceneAsset.h"
#include "GameInstanceData.h"

class GameData {
public:
    std::vector<GameObject*> objects = {};
    std::vector<GameObject*> objectsAdded = {};
    std::vector<GameObject*> objectsRemoved = {};
    std::unordered_map<int64, GameObject*> hashMap = {};
    int64 currentID;

    inline int64 nextID() {
        return ++currentID;
    }
};

GameData data = GameData();
GameSettings settings = GameSettings();

void GameEngine::init(const std::string& localPath) {
    settings = GameResources::init(localPath);
}

void GameEngine::start() {
    GameRender::start();
    data = GameData();
    data.currentID = 10000;

    SceneAsset* startScene = GameResources::loadScene(settings.startSceneHash);
    if (startScene == nullptr) {
        std::cout << "FAILED TO LOAD START SCENE" << std::endl;
    } else {
        startScene->instantiateItems();
    }
}

void GameEngine::stop() {

}

void GameEngine::updateList() {
    data.objects.insert(data.objects.end(), data.objectsAdded.begin(), data.objectsAdded.end());
    data.objectsAdded.clear();

    for (auto obj : data.objectsRemoved) {
        auto it = std::find(data.objects.begin(), data.objects.end(), obj);
        if (it != data.objects.end()) {
            std::swap(*it, data.objects.back());
            data.objects.pop_back();
        }
    }
    for (auto obj : data.objectsRemoved) {
        delete obj;
    }
    data.objectsRemoved.clear();
}

void GameEngine::loop() {
    for (auto obj : data.objects) {
        if (!obj->destroyed) {
            obj->onStep();
        }
    }
    updateList();
}

void GameEngine::render() {
    GameRender::begin();
    GameRender::setCamera(0, 0, 800, 600, 0, 0, 1, 1);
    GameRender::clear();
    for (auto obj : data.objects) {
        if (!obj->destroyed) {
            obj->onRender();
        }
    }
    GameRender::end();
}

GameObject* GameEngine::instantiate(GameInstanceData *instanceData) {
    GameObject* test = new GameObject(data.nextID()); // instance->objAsset->instance(data.nextID());
    test->build(*instanceData);
    onObjectCreated(test);
    return test;
}

void GameEngine::onObjectCreated(GameObject *gameObject) {
    data.objectsAdded.push_back(gameObject);
    data.hashMap.insert({gameObject->id, gameObject});
    gameObject->onCreate();
}

void GameEngine::onObjectDestroyed(GameObject *gameObject) {
    data.objectsRemoved.push_back(gameObject);
    data.hashMap.erase(gameObject->id);
    gameObject->onDestroy();
}

GameObject *GameEngine::findObject(int64 hashName) {
    auto it = data.hashMap.find(hashName);
    if (it != data.hashMap.end()) {
        return it->second;
    }
    return nullptr;
}