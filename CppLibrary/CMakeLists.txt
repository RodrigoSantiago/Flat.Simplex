cmake_minimum_required(VERSION 3.17)
project(Simplex)

set(CMAKE_CXX_STANDARD 11)

include_directories(include)
link_directories(lib)

file(GLOB SRC_FILES "*.cpp" "*/*.cpp" "*/*/*.cpp" "*/*/*/*.cpp")

add_executable(Simplex glad.c main.cpp ${SRC_FILES} test/Test.cpp test/Test.cpp test/Test.h simplex/values/Array.cpp simplex/values/Array.h simplex/values/Map.cpp simplex/values/Map.h simplex/values/Struct.cpp simplex/values/Struct.h simplex/Simplex.cpp simplex/values/Grid.cpp simplex/values/Grid.h simplex/values/Reference.cpp simplex/values/Reference.h simplex/managed/Asset.cpp simplex/managed/Asset.h simplex/managed/Object.cpp simplex/managed/Object.h simplex/values/Function.cpp simplex/values/Function.h simplex/values/Arguments.cpp simplex/values/Arguments.h test/System.cpp test/System.h simplex/Chars.h simplex/debug/Debug.cpp simplex/debug/Debug.h)

target_link_libraries(Simplex opengl32 gdi32 glfw3)