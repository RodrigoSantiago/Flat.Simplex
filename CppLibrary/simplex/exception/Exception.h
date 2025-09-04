//
// Created by Rodrigo on 27/07/2022.
//

#ifndef SIMPLEX_EXCEPTION_H
#define SIMPLEX_EXCEPTION_H

#include "../Base.h"

namespace simplex {
    [[noreturn]] Pointer ex_missing_field(Pointer fieldName, Pointer ownerType);
    [[noreturn]] Pointer ex_invalid_field(Pointer fieldName, Pointer ownerType);
    [[noreturn]] Pointer ex_invalid_assessor(Pointer assessorValue);
    [[noreturn]] Pointer ex_invalid_function();
    [[noreturn]] Pointer ex_invalid_object();
    [[noreturn]] Pointer ex_array_out_of_bounds(Pointer index);
    [[noreturn]] Pointer ex_array_invalid_length(Pointer length);
    [[noreturn]] Pointer ex_grid_invalid_size(Pointer width, Pointer height);
    [[noreturn]] Pointer ex_grid_out_of_bounds(Pointer width, Pointer height);
    [[noreturn]] Pointer ex_container_value(Pointer index);
}

#endif //SIMPLEX_EXCEPTION_H
