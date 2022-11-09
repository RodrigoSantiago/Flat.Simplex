//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_ASSET_H
#define SIMPLEX_ASSET_H

#include "../Base.h"
#include "../values/Pointer.h"

class Asset {
public:
    Reference* reference;
    void* variables;

    virtual ~Asset();

    virtual Pointer getTypeName();

    virtual Pointer& getField(long hashName);

    virtual Pointer& setField(long hashName, const Pointer& value);

    virtual Pointer& refField(long hashName);
};

#endif //SIMPLEX_ASSET_H
