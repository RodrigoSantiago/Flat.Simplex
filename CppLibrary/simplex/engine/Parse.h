//
// Created by Rodrigo on 03/09/2025.
//

#ifndef SIMPLEX_PARSE_H
#define SIMPLEX_PARSE_H

#include "../Base.h"

class Parse {
public:
    static int32 Int32(const std::string &s);
    static int64 Int64(const std::string &s);
    static float Float(const std::string &s);
    static bool Bool(const std::string &s);
};

#endif //SIMPLEX_PARSE_H
