//
// Created by Rodrigo on 29/07/2022.
//

#ifndef SIMPLEX_STRING_H
#define SIMPLEX_STRING_H

#include "../Base.h"
#include "Value.h"

class String : public Value {
public:
    long count;
    long length;
    char* chars;

    String();

    String(const String& string);

    String(const Chars& chars);

    String(const String& a, const String& b);

    String(const String& a, const Chars& b);

    String(const Chars& a, const String& b);

    String(const Chars& a, const Chars& b);

    ~String() override;

    VariableType::VariableType getType() const final;

    Pointer getString() const final;

    Double getNumber() const final;

    Double getBool() final;

    Value* reference() final;

    void deference() final;
};


#endif //SIMPLEX_STRING_H
