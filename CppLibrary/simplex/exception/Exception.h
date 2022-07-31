//
// Created by Rodrigo on 27/07/2022.
//

#ifndef SIMPLEX_EXCEPTION_H
#define SIMPLEX_EXCEPTION_H

#include "../Base.h"

namespace simplex {
    Pointer ex_missing_field(Pointer fieldName, Pointer ownerType);
    Pointer ex_invalid_field(Pointer fieldName, Pointer ownerType);
    Pointer ex_invalid_assessor(Pointer assessorValue);
    Pointer ex_invalid_function();
    Pointer ex_invalid_object();
    Pointer ex_array_out_of_bounds(Pointer index);
    Pointer ex_array_invalid_length(Pointer length);
    Pointer ex_grid_invalid_size(Pointer width, Pointer height);
    Pointer ex_grid_out_of_bounds(Pointer width, Pointer height);
    Pointer ex_missing_key(Pointer fieldName);
    Pointer ex_container_value(Pointer index);
}

#endif //SIMPLEX_EXCEPTION_H
