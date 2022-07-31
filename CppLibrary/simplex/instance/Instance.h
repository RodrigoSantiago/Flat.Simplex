//
// Created by Rodrigo on 27/07/2022.
//

#ifndef SIMPLEX_INSTANCE_H
#define SIMPLEX_INSTANCE_H

#include "../Base.h"

namespace simplex {
    Struct* instance_create(const String& id);
    Struct* instance_find_by_id(const String& id);
};


#endif //SIMPLEX_INSTANCE_H
