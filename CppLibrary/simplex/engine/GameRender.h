//
// Created by Rodrigo on 01/09/2025.
//

#ifndef SIMPLEX_GAMERENDER_H
#define SIMPLEX_GAMERENDER_H

#include "../Base.h"
#include "assets/SpriteAsset.h"

typedef struct vertex {
    float x, y;
} vertex;

typedef struct triangle {
    uint32 i1, i2, i3;
} triangle;

typedef struct paint {
    float image;
    float off0;
    float off1;
    float off2;

    float triangleCount;
    float vertexCount;
    float colorFilter;
    float scaleFilter;

    float color1[4];
    float color2[4];
} paint;

typedef struct camera {
    float x;
    float y;
    float w;
    float h;
    float scrX;
    float scrY;
    float scrW;
    float scrH;
} camera;

class GameRender {
    static paint currentPaint;
    static int32 currentVtx;
    static int32 currentElm;
    static camera cam;
    static std::vector<paint> paints;
    static std::vector<vertex> vtx;
    static std::vector<vertex> uvs;
    static std::vector<triangle> triangles;

    static uint32 shader;
    static int32 scrID;
    static int32 posID;
    static uint32 vao;
    static uint32 vbo;
    static uint32 ebo;
    static uint32 ubo;
    static int32 bPaint;
    static int32 bElement;
    static int32 bVertex;
    static uint32 curImg;


    static int32 maxUniforms;
    static int32 maxEboSize;
    static int32 maxVboSize;
    static int32 maxTexSize;

    static void triangle();
    static void setPaint(uint32 image, int32 color, int32 colorB, int32 colorFilter, int32 scaleFilter);
    static void ensureCapacity(int32 paint, int32 element, int32 vertex);
public:
    static void start();
    static uint32 createTexture(int32 width, int32 height, unsigned char* data);
    static void destroyTexture(uint32 textureID);
    static void begin();
    static void end();
    static void clear();
    static void flush();
    static void setCamera(float x, float y, float w, float h, float scrX, float scrY, float scrW, float scrH);
    static void drawLine(float x1, float y1, float x2, float y2, float width, int32 color);
    static void drawRectangle(float x, float y, float width, float height, int32 color, int32 colorA);
    static void drawEllipse(float x, float y, float width, float height, int32 color, int32 colorB);
    static void drawSprite(SpriteAsset* sprite, float x, float y, float width, float height, int32 anim, int32 frame,
                           float* transform, int32 color, int32 cFilter, int32 sFilter);
    static void drawImage(uint32 image,
                           float srcX, float srcY, float srcW, float srcH,
                           float dstX, float dstY, float dstW, float dstH, float* transform, int32 color, int32 cFilter, int32 sFilter);
    static void drawButton(SpriteAsset* sprite, float* transform, int32 color, int32 colorFilter, int32 scaleFilter);
    static void drawTileset(SpriteAsset* sprite);
};


#endif //SIMPLEX_GAMERENDER_H
