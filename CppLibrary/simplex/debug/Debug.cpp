//
// Created by Rodrigo on 31/07/2022.
//

#include "Debug.h"
#include "../Simplex.h"
#include <iostream>

void simplex::debug_log(Pointer ptr) {
    std::cout << AS_STRING(ptr.getString()).chars << std::endl;
}
