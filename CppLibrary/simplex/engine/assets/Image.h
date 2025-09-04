//
// Created by Rodrigo on 03/09/2025.
//

#ifndef SIMPLEX_IMAGE_H
#define SIMPLEX_IMAGE_H

#include "../../Base.h"

class Image {
public:
    int32 width;
    int32 height;
    unsigned char* data;
    uint32 imageID;

    Image(int32 width, int32 height, unsigned char* data);
    ~Image();
};


#endif //SIMPLEX_IMAGE_H
