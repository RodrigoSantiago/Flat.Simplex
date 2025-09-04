//
// Created by Rodrigo on 04/09/2025.
//

#ifndef SIMPLEX_SPRITEANIM_H
#define SIMPLEX_SPRITEANIM_H

#include "../../Base.h"

class Image;

class SpriteAnim {
public:
    std::string name;
    int32 size;
    std::string atlas;
    int32 atlas_w;
    int32 atlas_h;
    Image* image;
};


#endif //SIMPLEX_SPRITEANIM_H
