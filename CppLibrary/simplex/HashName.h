//
// Created by Rodrigo on 28/07/2022.
//

#ifndef SIMPLEX_HASHNAME_H
#define SIMPLEX_HASHNAME_H

#include "Base.h"

class HashName {
public:
    enum FieldNames {
        _undefined,
        _length,
        _keys,
        _depth
    };

    static const Chars& getName(long hashName);
};


#endif //SIMPLEX_HASHNAME_H
