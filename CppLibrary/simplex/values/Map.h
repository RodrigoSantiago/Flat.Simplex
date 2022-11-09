//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_MAP_H
#define SIMPLEX_MAP_H

#include "../Base.h"
#include "Value.h"
#include "Pointer.h"

struct MapInit {
public:
    Pointer index;
    Pointer value;
};

class Map : public Value {
public:
    long count;
    void* mapS;
    void* mapD;

    Map();

    Map(const Map& copy) = delete;

    Map(long size, const MapInit *initList);

    ~Map() override;

    VariableType::VariableType getType() const final;

    Pointer getString() const final;

    Double getBool() final;

    Value* reference() final;

    void deference() final;

    Pointer& index(const Pointer& index) final;

    Pointer& indexNum(Double index) final;

    Pointer& indexStr(const String& index) final;
};

template <long N>
inline Pointer m(const MapInit (& initList) [N]) {
    return Pointer(new Map(N, initList));
}

#endif //SIMPLEX_MAP_H
