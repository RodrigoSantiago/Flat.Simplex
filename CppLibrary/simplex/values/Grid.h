//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_GRID_H
#define SIMPLEX_GRID_H

#include "../Base.h"
#include "Value.h"
#include "Pointer.h"

class Grid : public Value {
public:
    long count;
    long long width;
    long long height;
    Pointer* pointers;

    Grid();

    Grid(const Grid& copy) = delete;

    explicit Grid(const Pointer& width, const Pointer& height);

    explicit Grid(long width, long size, Pointer* pointers);

    ~Grid() override;

    VariableType::VariableType getType() const final;

    Pointer getString() const final;

    Double getBool() final;

    Value* reference() final;

    void deference() final;

    Pointer& indexGrid(const Pointer& x, const Pointer& y) final;
};

template <typename ... T>
inline Pointer g(long width, const T& ... values) {
    constexpr long size = sizeof ... (T);
    return new Grid(width, size, new Pointer[size] {
            values...
    });
}

#endif //SIMPLEX_GRID_H
