cmake_minimum_required(VERSION 3.17)
project(Simplex)

set(CMAKE_CXX_STANDARD 11)

include_directories(include)
link_directories(lib)

file(GLOB SRC_FILES "*.cpp" "*/*.cpp" "*/*/*.cpp" "*/*/*/*.cpp")

add_executable(Simplex glad.c main.cpp ${SRC_FILES}
        test/Test.cpp
        test/Test.cpp
        test/Test.h
        simplex/values/Array.cpp
        simplex/values/Map.cpp
        simplex/values/Struct.cpp
        simplex/Simplex.cpp
        simplex/values/Grid.cpp
        simplex/values/Reference.cpp
        simplex/managed/Managed.cpp
        simplex/values/Function.cpp
        simplex/values/Arguments.cpp
        simplex/engine/Parse.cpp
        test/System.cpp
        simplex/debug/Debug.cpp
        simplex/engine/GameEngine.cpp
        simplex/engine/GameObject.cpp
        simplex/engine/GameObjectModule.cpp
        simplex/engine/GameRender.cpp
        simplex/engine/GameInstanceData.cpp
        simplex/engine/assets/GameResources.cpp
        simplex/engine/assets/SceneAsset.cpp
        simplex/engine/assets/SceneCamera.cpp
        simplex/engine/assets/SceneItem.cpp
        simplex/engine/assets/ObjectAsset.cpp
        simplex/engine/assets/ObjectModule.cpp
        simplex/engine/assets/SpriteAsset.cpp
        simplex/engine/assets/AssetEntry.cpp
        simplex/engine/assets/Image.cpp)

target_link_libraries(Simplex opengl32 gdi32 glfw3 box2d)