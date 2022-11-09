//
// Created by Rodrigo on 27/07/2022.
//

#include "Exception.h"
#include "../Simplex.h"
#include <stdexcept>

std::runtime_error throwException(Pointer str) {
    return std::runtime_error(AS_STRING(str.getString()).chars);
}

Pointer simplex::ex_missing_field(Pointer message, Pointer ownerType) {
    throw throwException(Pointer(s("Variable ") + message + s(" not found on a ")) + ownerType);
}

Pointer simplex::ex_invalid_field(Pointer fieldName, Pointer ownerType) {
    throw throwException(Pointer(s("Variable ") + fieldName + s(" cannot be set on a ") + ownerType));
}

Pointer simplex::ex_invalid_assessor(Pointer assessor) {
    throw throwException(Pointer(s("Invalid assessor [") + assessor + s("]")));
}

Pointer simplex::ex_invalid_function() {
    throw throwException(Pointer(s("Invalid function call")));
}

Pointer simplex::ex_invalid_object() {
    throw throwException(Pointer(s("Object not found or destroyed")));
}

Pointer simplex::ex_array_out_of_bounds(Pointer index) {
    throw throwException(Pointer(s("Array index out of bounds [") + index + s("]")));
}

Pointer simplex::ex_container_value(Pointer index) {
    throw throwException(Pointer(s("A container cant have a container as member [") + index + s("]")));
}

Pointer simplex::ex_array_invalid_length(Pointer length) {
    throw throwException(Pointer(s("Invalid array length [") + length + s("]")));
}

Pointer simplex::ex_grid_invalid_size(Pointer width, Pointer height) {
    throw throwException(Pointer(s("Invalid grid size [") + width + s(", ") + height + s("]")));
}

Pointer simplex::ex_grid_out_of_bounds(Pointer width, Pointer height) {
    throw throwException(Pointer(s("Grid index out of bounds [") + width + s(", ") + height + s("]")));
}
