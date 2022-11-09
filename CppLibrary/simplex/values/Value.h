//
// Created by Rodrigo on 29/07/2022.
//

#ifndef SIMPLEX_VALUE_H
#define SIMPLEX_VALUE_H

#include "../Base.h"

class Value {
public:
    static Value undefined;

    virtual ~Value();

    virtual VariableType::VariableType getType() const;

    virtual Pointer getTypeName() const;

    virtual Pointer getString() const;

    virtual Double getNumber() const;

    virtual Double getBool();

    virtual Value* reference();

    virtual void deference();

    virtual Pointer& getField(long hashName);

    virtual Pointer& setField(long hashName, const Pointer& value);

    virtual Pointer& refField(long hashName);

    virtual Pointer& index(const Pointer& index);

    virtual Pointer& setIndex(const Pointer& index, const Pointer& value);

    virtual Pointer& indexNum(Double index);

    virtual Pointer& setIndexNum(Double index, const Pointer& value);

    virtual Pointer& indexStr(const String& index);

    virtual Pointer& setIndexStr(const String& index, const Pointer& value);

    virtual Pointer& indexGrid(const Pointer& x, const Pointer& y);

    virtual Pointer& setIndexGrid(const Pointer& x, const Pointer& y, const Pointer& value);

    virtual Pointer execute(const Pointer& self, const Pointer& args);
};

#endif //SIMPLEX_VALUE_H
