//
// Created by Rodrigo on 02/09/2025.
//

#ifndef SIMPLEX_GAMERESOURCES_H
#define SIMPLEX_GAMERESOURCES_H

#include "../../Base.h"
#include "../GameSettings.h"

class Image;
class GameAsset;
class AssetEntry;
class SpriteAsset;
class SceneAsset;
class ObjectAsset;

typedef struct file {
    int32 size;
    char* data;
} file;

typedef struct pair {
    std::string left;
    std::string right;
} pair;

class GameResources {
    static std::unordered_map<int64, AssetEntry*> assetsByHash;
    static std::unordered_map<std::string, AssetEntry*> assetsByName;
    static std::unordered_map<std::string, AssetEntry*> assetsByPath;

    static std::string localData;
    static std::unordered_map<int64, GameAsset*> assets;
    static GameAsset* loadAsset(int64 hashName);
public:
    static GameSettings init(const std::string& localData);

    static file readFile(const std::string& fileName);
    static std::vector<std::string> readLines(const std::string& fileName);
    static std::vector<pair> readPairs(const std::string& fileName);
    static Image* readImage(const std::string& fileName);
    static std::string getFileName(AssetEntry* entry);
    static std::string getFileName(const std::string& path);

    static SpriteAsset* loadSprite(int64 hashName);
    static SpriteAsset* loadSprite(const std::string& hashName);
    static SceneAsset* loadScene(int64 hashName);
    static SceneAsset* loadScene(const std::string& hashName);
    static ObjectAsset* loadObject(int64 hashName);
    static ObjectAsset* loadObject(const std::string& hashName);
};


#endif //SIMPLEX_GAMERESOURCES_H
