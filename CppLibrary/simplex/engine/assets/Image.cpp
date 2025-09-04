//
// Created by Rodrigo on 03/09/2025.
//

#include "Image.h"
#include "../GameRender.h"

#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

Image::Image(int32 width, int32 height, unsigned char *data) : width(width), height(height), data(data), imageID(0) {

}

Image::~Image() {
    stbi_image_free(data);
    if (imageID != 0) {
        GameRender::destroyTexture(imageID);
    }
}