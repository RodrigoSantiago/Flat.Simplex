//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_OBJECT_H
#define SIMPLEX_OBJECT_H

#include "Asset.h"
#include "../values/Pointer.h"

class Object : public Asset {
public:
    Pointer& _depth;

    Object();

    virtual void start();

    virtual void update();

    virtual void destroy();

    virtual void render();
};


#endif //SIMPLEX_OBJECT_H
