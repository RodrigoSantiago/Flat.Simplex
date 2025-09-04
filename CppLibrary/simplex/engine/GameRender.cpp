//
// Created by Rodrigo on 01/09/2025.
//

#include "GameRender.h"
#include "assets/SpriteAsset.h"
#include "assets/Image.h"
#include <iostream>
#include <glad/glad.h>

const char *vertexShaderSource =
        "#version 330 core\n"
        "layout (location = 0) in vec2 aPos;\n"
        "layout (location = 1) in vec2 aTex;\n"
        "uniform vec4 scr;\n"
        "uniform vec4 pos;\n"
        "out vec2 oPos;\n"
        "out vec2 oTex;\n"
        "void main()"
        "{"
        "    vec2 rel = (aPos - pos.xy) / pos.zw;"
        "    vec2 screenPos = scr.xy + rel * scr.zw;"
        "    screenPos.y = 1.0 - screenPos.y;"
        "    vec2 clipPos = screenPos * 2.0 - 1.0;"
        "    gl_Position = vec4(clipPos, 0.0, 1.0);"
        "    oTex = aTex;"
        "}\0";

const char *fragmentShaderSource =
        "#version 330 core\n"
        "out vec4 FragColor;\n"
        "layout (std140) uniform Paint {\n"
        "    vec4 image;\n"
        "    vec4 data;\n"
        "    vec4 color1;\n"
        "    vec4 color2;\n"
        "};\n"
        "uniform sampler2D tex;\n"
        "in vec2 oPos;"
        "in vec2 oTex;"
        "void main()"
        "{"
        "    float t = clamp(oTex.x, 0.0, 1.0);"
        "    vec4 gradColor = mix(color1, color2, t);"
        "    // FragColor = gradColor;\n"
        "    vec4 texColor = texture(tex, oTex);\n"
        "    FragColor = (int(image.x) == 0 ? vec4(1, 1, 1, 1) : texColor) * gradColor;\n"
        "}\0";

int32 _get_align() {
    GLint align;
    glGetIntegerv(GL_UNIFORM_BUFFER_OFFSET_ALIGNMENT, &align);
    return (GLint) ((sizeof(paint) - 1) / align + 1) * align;
}

void _logErr(int count) {
    int32 err;
    err = glGetError();
    std::cout << "Err(" << count << ") : " << err << std::endl;
}

int32 renderAlign() {
    static int32 align = _get_align();
    return align;
}

paint GameRender::currentPaint = {};
int32 GameRender::currentVtx = 0;
int32 GameRender::currentElm = 0;
camera GameRender::cam = {};
std::vector<paint> GameRender::paints = {};
std::vector<vertex> GameRender::vtx = {};
std::vector<vertex> GameRender::uvs = {};
std::vector<triangle> GameRender::triangles = {};

uint32 GameRender::shader = 0;
int32 GameRender::scrID = 0;
int32 GameRender::posID = 0;
uint32 GameRender::vao = 0;
uint32 GameRender::vbo = 0;
uint32 GameRender::ebo = 0;
uint32 GameRender::ubo = 0;
int32 GameRender::bPaint = 0;
int32 GameRender::bElement = 0;
int32 GameRender::bVertex = 0;
uint32 GameRender::curImg = 0;

int32 GameRender::maxUniforms = 0;
int32 GameRender::maxEboSize = 0;
int32 GameRender::maxVboSize = 0;
int32 GameRender::maxTexSize = 0;

void GameRender::start() {
    currentPaint = {};
    currentVtx = 0;
    currentElm = 0;

    unsigned int vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &vertexShaderSource, NULL);
    glCompileShader(vertexShader);

    int success;
    char infoLog[512];
    glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(vertexShader, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << infoLog << std::endl;
    }

    unsigned int fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &fragmentShaderSource, NULL);
    glCompileShader(fragmentShader);
    glGetShaderiv(fragmentShader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(fragmentShader, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::FRAGMENT::COMPILATION_FAILED\n" << infoLog << std::endl;
    }

    shader = glCreateProgram();
    glAttachShader(shader, vertexShader);
    glAttachShader(shader, fragmentShader);
    glLinkProgram(shader);
    glGetProgramiv(shader, GL_LINK_STATUS, &success);
    if (!success) {
        glGetProgramInfoLog(shader, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::PROGRAM::LINKING_FAILED\n" << infoLog << std::endl;
    }
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);

    glGenVertexArrays(1, &vao);
    glGenBuffers(1, &vbo);
    glGenBuffers(1, &ebo);
    glGenBuffers(1, &ubo);

    GLuint paintIndex = glGetUniformBlockIndex(shader, "Paint");
    glUniformBlockBinding(shader, paintIndex, 0);
    scrID = glGetUniformLocation(shader, "scr");
    posID = glGetUniformLocation(shader, "pos");

    glGetIntegerv(GL_MAX_UNIFORM_BLOCK_SIZE, &maxUniforms);
    glGetIntegerv(GL_MAX_ELEMENTS_INDICES, &maxEboSize);
    glGetIntegerv(GL_MAX_ELEMENTS_VERTICES, &maxVboSize);
    glGetIntegerv(GL_MAX_TEXTURE_SIZE, &maxTexSize);

    maxUniforms = std::min((int32)512, (int32)(maxUniforms / renderAlign()));
    maxEboSize = std::min((int32)32768, (int32)(maxEboSize / 3));
    maxVboSize = std::min((int32)32768, (int32)(maxVboSize / 4));
    maxTexSize = std::min((int32)4096, (int32)(maxTexSize));
}

uint32 GameRender::createTexture(int32 width, int32 height, unsigned char* data) {
    glActiveTexture(GL_TEXTURE0);

    uint32 img;
    glGenTextures(1, &img);
    glBindTexture(GL_TEXTURE_2D, img);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_BORDER);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

    glBindTexture(GL_TEXTURE_2D, 0);
    curImg = 0;

    return img;
}

void GameRender::destroyTexture(uint32 textureID) {
    glBindTexture(GL_TEXTURE_2D, 0);
    curImg = 0;

    glDeleteTextures(1, &textureID);
}

void GameRender::begin() {
    glUseProgram(shader);
    glEnable(GL_BLEND);
    glBlendEquationSeparate(GL_FUNC_ADD, GL_FUNC_ADD);
    glBlendFuncSeparate(GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA);

    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, 0);
    curImg = 0;

    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

    glBindVertexArray(vao);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
    glBindBuffer(GL_UNIFORM_BUFFER, ubo);
}

void GameRender::end() {
    flush();

    glBindVertexArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
    glBindBuffer(GL_UNIFORM_BUFFER, 0);
}

void GameRender::clear() {
    glClearColor(0, 0, 0, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
}

void GameRender::flush() {
    if (currentPaint.triangleCount > 0) {
        paints.push_back({currentPaint});
        currentPaint.vertexCount = 0;
        currentPaint.triangleCount = 0;
    }
    glUniform4f(posID, cam.x, cam.y, cam.w, cam.h);
    glUniform4f(scrID, cam.scrX, cam.scrY, cam.scrW, cam.scrH);
    int32 pSize = paints.size();
    int32 eSize = triangles.size();
    int32 vSize = vtx.size();
    if (pSize > 0) {
        ensureCapacity(pSize, eSize, vSize);

        glBufferSubData(GL_UNIFORM_BUFFER, 0, pSize * renderAlign(), paints.data());
        glBufferSubData(GL_ELEMENT_ARRAY_BUFFER, 0, eSize * sizeof(int32) * 3, triangles.data());
        glBufferSubData(GL_ARRAY_BUFFER, 0, vSize * sizeof(float) * 2, vtx.data());
        glBufferSubData(GL_ARRAY_BUFFER, vSize * sizeof(float) * 2, vSize * sizeof(float) * 2, uvs.data());

        int32 pos = 0;
        for (int32 i = 0; i < pSize; i++) {
            paint &curPaint = paints[i];
            int32 renderElements = static_cast<int32>(curPaint.triangleCount) * 3;

            glBindBufferRange(GL_UNIFORM_BUFFER, 0, ubo, i * renderAlign(), renderAlign());
            uint32 li = static_cast<uint32>(curPaint.image);
            if (curImg != li) {
                glActiveTexture(GL_TEXTURE0);
                glBindTexture(GL_TEXTURE_2D, li);
                curImg = li;
            }
            glDrawElements(GL_TRIANGLES, (GLsizei) (renderElements), GL_UNSIGNED_INT, (void*) (pos * sizeof(int32)));

            pos += renderElements;
        }
    }

    currentVtx = 0;
    currentElm = 0;
    paints.clear();
    triangles.clear();
    vtx.clear();
    uvs.clear();
}

void GameRender::setCamera(float x, float y, float w, float h, float scrX, float scrY, float scrW, float scrH) {
    cam.x = x;
    cam.y = y;
    cam.w = w;
    cam.h = h;
    cam.scrX = scrX;
    cam.scrY = scrY;
    cam.scrW = scrW;
    cam.scrH = scrH;
}

void GameRender::drawLine(float x1, float y1, float x2, float y2, float width, int32 color) {

}

void GameRender::drawRectangle(float x, float y, float width, float height, int32 color, int32 colorA) {
    setPaint(0, color, colorA, 0, 0);
    vtx.push_back({x, y});
    vtx.push_back({x, y + height});
    vtx.push_back({x + width, y + height});
    vtx.push_back({x + width, y});
    uvs.push_back({0, 0});
    uvs.push_back({0, 1});
    uvs.push_back({1, 1});
    uvs.push_back({1, 0});
    triangle();
}

void GameRender::drawEllipse(float x, float y, float width, float height, int32 color, int32 colorB) {

}

void GameRender::drawSprite(SpriteAsset *sprite, float x, float y, float width, float height, int32 anim, int32 frame,
                            float *transform, int32 color, int32 cFilter, int32 sFilter) {
    if (sprite == nullptr) return;

    SpriteAnim& sprAnim = sprite->animations[anim];
    if (sprAnim.image->imageID == 0) {
        sprAnim.image->imageID = createTexture(sprAnim.image->width, sprAnim.image->height, sprAnim.image->data);
    }
    frame = frame % sprAnim.size;
    int32 strip = sprAnim.atlas_w / sprite->width;
    float sw = static_cast<float>(sprite->width) / static_cast<float>(sprAnim.atlas_w);
    float sh = static_cast<float>(sprite->height) / static_cast<float>(sprAnim.atlas_h);
    float sx = static_cast<float>(frame % strip) * sw;
    float sy = static_cast<float>(frame / strip) * sh;
    drawImage(sprAnim.image->imageID,
              sx, sy, sw, sh,
              x, y, x + width, y + height, transform, color, cFilter, sFilter);
}

void GameRender::drawImage(uint32 image, float srcX1, float srcY1, float srcX2, float srcY2,
                            float dstX1, float dstY1, float dstX2, float dstY2, float *transform,
                            int32 color, int32 cFilter, int32 sFilter) {
    setPaint(image, color, color, cFilter, sFilter);
    vtx.push_back({dstX1, dstY1});
    vtx.push_back({dstX1, dstY2});
    vtx.push_back({dstX2, dstY2});
    vtx.push_back({dstX2, dstY1});
    uvs.push_back({srcX1, srcY1});
    uvs.push_back({srcX1, srcY2});
    uvs.push_back({srcX2, srcY2});
    uvs.push_back({srcX2, srcY1});
    triangle();
}

void GameRender::drawButton(SpriteAsset *sprite, float *transform, int32 color, int32 colorFilter, int32 scaleFilter) {

}

void GameRender::drawTileset(SpriteAsset *sprite) {

}

void GameRender::triangle() {
    uint32 c0 = static_cast<uint32>(currentVtx);
    uint32 c1 = static_cast<uint32>(currentVtx + 1);
    uint32 c2 = static_cast<uint32>(currentVtx + 2);
    uint32 c3 = static_cast<uint32>(currentVtx + 3);
    triangles.push_back({c0, c1, c2});
    triangles.push_back({c0, c2, c3});
    currentVtx += 4;
    currentElm += 2;
    currentPaint.vertexCount += 4;
    currentPaint.triangleCount += 2;
}

void GameRender::setPaint(uint32 image, int32 color, int32 colorB, int32 colorFilter, int32 scaleFilter) {
    if (currentVtx + 4 >= maxVboSize || currentElm + 2 >= maxEboSize || paints.size() + 1 >= maxUniforms) {
        flush();
    }
    uint32 li = *reinterpret_cast<uint32*>(&currentPaint.image);
    float colors[4] = {
            ((color >> 24) & 0xFF) / 255.0f,
            ((color >> 16) & 0xFF) / 255.0f,
            ((color >> 8) & 0xFF) / 255.0f,
            ((color >> 0) & 0xFF) / 255.0f
    };
    float colorsB[4] = {
            ((colorB >> 24) & 0xFF) / 255.0f,
            ((colorB >> 16) & 0xFF) / 255.0f,
            ((colorB >> 8) & 0xFF) / 255.0f,
            ((colorB >> 0) & 0xFF) / 255.0f
    };
    if (currentVtx == 0 || li != image
        || currentPaint.colorFilter != colorFilter
        || currentPaint.scaleFilter != scaleFilter
        || currentPaint.color1[0] != colors[0]
        || currentPaint.color1[1] != colors[1]
        || currentPaint.color1[2] != colors[2]
        || currentPaint.color1[3] != colors[3]
        || currentPaint.color2[0] != colorsB[0]
        || currentPaint.color2[1] != colorsB[1]
        || currentPaint.color2[2] != colorsB[2]
        || currentPaint.color2[3] != colorsB[3]) {
        if (currentPaint.triangleCount > 0) {
            paints.push_back({currentPaint});
            currentPaint.vertexCount = 0;
            currentPaint.triangleCount = 0;
        }

        currentPaint.image = static_cast<float>(image);
        currentPaint.colorFilter = colorFilter;
        currentPaint.scaleFilter = scaleFilter;
        currentPaint.color1[0] = colors[0];
        currentPaint.color1[1] = colors[1];
        currentPaint.color1[2] = colors[2];
        currentPaint.color1[3] = colors[3];
        currentPaint.color2[0] = colorsB[0];
        currentPaint.color2[1] = colorsB[1];
        currentPaint.color2[2] = colorsB[2];
        currentPaint.color2[3] = colorsB[3];
    }
}

void GameRender::ensureCapacity(int32 paint, int32 element, int32 vertex) {

    // Uniform Buffer
    if (bPaint < paint) {
        bPaint = paint;
        glBufferData(GL_UNIFORM_BUFFER, bPaint * renderAlign(), NULL, GL_STATIC_DRAW);
    }

    // Vertices + UVs
    if (bVertex < vertex) {
        bVertex = vertex;
        glBufferData(GL_ARRAY_BUFFER, bVertex * sizeof(float) * 4, NULL, GL_STATIC_DRAW);

        // pos
        glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (void *) 0);
        glEnableVertexAttribArray(0);

        // uv
        glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (void *) (vertex * sizeof(float) * 2));
        glEnableVertexAttribArray(1);
    }

    // Elements
    if (bElement < element) {
        bElement = element;

        glBufferData(GL_ELEMENT_ARRAY_BUFFER, bElement * sizeof(int32) * 3, NULL, GL_STATIC_DRAW);
    }
}