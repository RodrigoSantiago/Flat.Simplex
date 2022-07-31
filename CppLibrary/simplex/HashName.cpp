//
// Created by Rodrigo on 28/07/2022.
//

#include "HashName.h"

Chars names[]  = {
        "undefined",
        "length",
        "keys",
        "depth"
};

const Chars &HashName::getName(long hashName) {
    return names[hashName];
}
