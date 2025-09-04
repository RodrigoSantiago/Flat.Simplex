//
// Created by Rodrigo on 01/09/2025.
//

#ifndef SIMPLEX_GAMEENGINE_H
#define SIMPLEX_GAMEENGINE_H

#include "../Base.h"

class GameObject;
class GameInstanceData;

class GameEngine {
public:
    static void init(const std::string& localPath);
    static void start();
    static void stop();

    static void loop();
    static void render();
    static void updateList();

    static GameObject* instantiate(GameInstanceData* instance);
    static void onObjectCreated(GameObject* gameObject);
    static void onObjectDestroyed(GameObject* gameObject);
    static GameObject* findObject(int64 hashName);
};


#endif //SIMPLEX_GAMEENGINE_H
