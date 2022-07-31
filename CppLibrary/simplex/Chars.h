//
// Created by Rodrigo on 31/07/2022.
//

#ifndef SIMPLEX_CHARS_H
#define SIMPLEX_CHARS_H

class Chars {
public:
    const char* chars;
    Chars() : chars(nullptr) {}
    Chars(const char* chars) : chars(chars) {}
};

inline Chars s(const char * chars) {
    return {chars};
}

namespace simplex {
    inline int strcmp(const char* s1, const char* s2){
        while(*s1 && (*s1 == *s2)){
            s1++;
            s2++;
        }
        return *(const unsigned char*)s1 - *(const unsigned char*)s2;
    }
}

#endif //SIMPLEX_CHARS_H
