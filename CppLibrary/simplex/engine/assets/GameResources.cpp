//
// Created by Rodrigo on 02/09/2025.
//

#include "GameResources.h"
#include "../Parse.h"
#include "../GameAsset.h"
#include "../GameSettings.h"
#include "Assets.h"
#include "AssetEntry.h"
#include "Image.h"

#include "stb_image.h"

#include <fstream>
#include <cstring>

std::unordered_map<int64, AssetEntry*> GameResources::assetsByHash = {};
std::unordered_map<std::string, AssetEntry*> GameResources::assetsByName = {};
std::unordered_map<std::string, AssetEntry*> GameResources::assetsByPath = {};

std::unordered_map<int64, GameAsset*> GameResources::assets = {};
std::string GameResources::localData = "";

GameAsset *GameResources::loadAsset(int64 hashName) {
    auto it = assets.find(hashName);
    if (it != assets.end()) {
        return it->second;
    }
    auto local = assetsByHash.find(hashName);
    if (local != assetsByHash.end()) {
        GameAsset* ast;
        if (local->second->type == GameAsset::SPRITE) {
            ast = SpriteAsset::readAsset(local->second);

        } else if (local->second->type == GameAsset::SCENE) {
            ast = SceneAsset::readAsset(local->second);

        } else if (local->second->type == GameAsset::OBJECT) {
            ast = ObjectAsset::readAsset(local->second);

        } else {
            return nullptr;
        }
        assets[hashName] = ast;
        return ast;
    }
    return nullptr;
}

GameSettings GameResources::init(const std::string& localData) {
    GameResources::localData = localData;

    std::vector<pair> pairs = readPairs(localData + "/game_data");

    int32 i = 0;
    GameSettings settings = {};
    settings.startSceneHash = Parse::Int64(pairs[i++].right);
    settings.fpsMax = Parse::Int32(pairs[i++].right);
    settings.vsync = Parse::Int32(pairs[i++].right);
    settings.aspect = Parse::Int32(pairs[i++].right);
    settings.aspectX = Parse::Float(pairs[i++].right);
    settings.aspectY = Parse::Float(pairs[i++].right);
    settings.orientation = Parse::Int32(pairs[i++].right);
    settings.scaleMode = Parse::Int32(pairs[i++].right);
    settings.scaleFilter = Parse::Int32(pairs[i++].right);
    settings.fullscreen = Parse::Bool(pairs[i++].right);
    settings.resizeable = Parse::Bool(pairs[i++].right);
    settings.pause = Parse::Bool(pairs[i++].right);

    while (i < pairs.size()) {
        pair hashPair = pairs[i++];
        pair namePair = pairs[i++];
        pair pathPair = pairs[i++];
        pair typePair = pairs[i++];

        AssetEntry* entry = new AssetEntry();
        entry->hash = Parse::Int64(hashPair.right);
        entry->name = namePair.right;
        entry->path = pathPair.right;
        entry->type = Managed::parseType(typePair.right);

        assetsByHash[entry->hash] = entry;
        assetsByName[entry->name] = entry;
        assetsByPath[entry->path] = entry;
    }

    return settings;
}

std::string GameResources::getFileName(AssetEntry *entry) {
    return localData + "/" + std::to_string(entry->hash) + ".asset";
}

std::string GameResources::getFileName(const std::string& path) {
    return localData + "/" + path;
}

file GameResources::readFile(const std::string& filename) {
    std::ifstream in(filename, std::ios::binary | std::ios::ate);
    file result;
    result.size = 0;
    result.data = nullptr;

    if (!in.is_open()) {
        return result;
    }

    std::streamsize size = in.tellg();
    in.seekg(0, std::ios::beg);

    char* buffer = new char[size];
    if (in.read(buffer, size)) {
        result.size = static_cast<int32>(size);
        result.data = buffer;
    } else {
        delete[] buffer;
    }

    return result;
}

std::vector<std::string> GameResources::readLines(const std::string& filename) {
    std::vector<std::string> lines;
    std::ifstream in(filename);
    if (!in.is_open()) return lines;

    std::string line;
    while (std::getline(in, line)) {
        lines.push_back(line);
    }

    return lines;
}

std::vector<pair> GameResources::readPairs(const std::string& filename) {
    std::vector<pair> pairs;
    std::ifstream in(filename);
    if (!in.is_open()) return pairs;

    std::string line;
    while (std::getline(in, line)) {
        size_t pos = line.find('=');
        if (pos != std::string::npos) {
            if (!line.empty() && line.back() == '\r') {
                line.pop_back();
            }

            pair p;
            p.left = line.substr(0, pos);
            p.right = line.substr(pos + 1);
            pairs.push_back(p);
        }
    }

    return pairs;
}

Image* GameResources::readImage(const std::string& filename) {
    file file = readFile(filename);

    int w, h, ch;
    unsigned char *imageDataBuffer = stbi_load_from_memory(reinterpret_cast<unsigned char*>(file.data), file.size, &w, &h, &ch, 4);
    delete file.data;

    if (imageDataBuffer == NULL) {
        return nullptr;
    }
    return new Image(static_cast<int32>(w), static_cast<int32>(h), imageDataBuffer);
}

SpriteAsset *GameResources::loadSprite(int64 hashName) {
    GameAsset * asset = loadAsset(hashName);
    if (asset != nullptr && asset->getType() == GameAsset::SPRITE) {
        return static_cast<SpriteAsset*>(asset);
    }
    return nullptr;
}

SpriteAsset *GameResources::loadSprite(const std::string& hashName) {
    if (!hashName.empty() && hashName[0] == '/') {
        auto it2 = assetsByPath.find(hashName + ".sprite");
        if (it2 != assetsByPath.end()) {
            return loadSprite(it2->second->hash);
        }
    } else {
        auto it = assetsByName.find(hashName + ".sprite");
        if (it != assetsByName.end()) {
            return loadSprite(it->second->hash);
        }
    }
    return nullptr;
}

SceneAsset *GameResources::loadScene(int64 hashName) {
    GameAsset * asset = loadAsset(hashName);
    if (asset != nullptr && asset->getType() == GameAsset::SCENE) {
        return static_cast<SceneAsset*>(asset);
    }
    return nullptr;
}

SceneAsset *GameResources::loadScene(const std::string& hashName) {
    if (!hashName.empty() && hashName[0] == '/') {
        auto it2 = assetsByPath.find(hashName + ".scene");
        if (it2 != assetsByPath.end()) {
            return loadScene(it2->second->hash);
        }
    } else {
        auto it = assetsByName.find(hashName + ".scene");
        if (it != assetsByName.end()) {
            return loadScene(it->second->hash);
        }
    }
    return nullptr;
}

ObjectAsset *GameResources::loadObject(int64 hashName) {
    GameAsset * asset = loadAsset(hashName);
    if (asset != nullptr && asset->getType() == GameAsset::OBJECT) {
        return static_cast<ObjectAsset*>(asset);
    }
    return nullptr;
}

ObjectAsset *GameResources::loadObject(const std::string& hashName) {
    if (!hashName.empty() && hashName[0] == '/') {
        auto it2 = assetsByPath.find(hashName + ".object");
        if (it2 != assetsByPath.end()) {
            return loadObject(it2->second->hash);
        }
    } else {
        auto it = assetsByName.find(hashName + ".object");
        if (it != assetsByName.end()) {
            return loadObject(it->second->hash);
        }
    }
    return nullptr;
}

