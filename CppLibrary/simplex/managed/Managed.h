//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_MANAGED_H
#define SIMPLEX_MANAGED_H

#include "../Base.h"
#include "../values/Pointer.h"

class Managed {
public:
    enum Type {
        UNKNOWN, SPRITE, SCENE, OBJECT
    };
private:
    Type type;
public:
    Reference* reference;
    std::unordered_map<long, Pointer> variables;

    Managed(Type type);

    virtual ~Managed();

    virtual Pointer getTypeName();

    virtual Pointer& getField(long hashName);

    virtual Pointer& setField(long hashName, const Pointer& value);

    virtual Pointer& refField(long hashName);

    inline Type getType() { return type; }

    inline static Type parseType(const std::string& s) {
        if (s == "SPRITE") return Managed::SPRITE;
        if (s == "SCENE")  return Managed::SCENE;
        if (s == "OBJECT") return Managed::OBJECT;
        return Managed::UNKNOWN;
    }

};

#endif //SIMPLEX_MANAGED_H
