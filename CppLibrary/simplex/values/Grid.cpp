//
// Created by Rodrigo on 30/07/2022.
//

#include "Grid.h"
#include "../Simplex.h"

Grid::Grid() : pointers(nullptr), count(0) {

}

Grid::Grid(const Pointer &width, const Pointer &height) : count(0) {
    if (!width.isNumber() || !height.isNumber()) {
        throw simplex::ex_grid_out_of_bounds(width, height);
    }

    this->width = simplex::to_int(width.getNumber());
    this->height = simplex::to_int(height.getNumber());
    if (this->width < 0 || this->height < 0) {

        throw simplex::ex_grid_out_of_bounds(width, height);
    }

    pointers = new Pointer[this->width * this->height];
}

Grid::Grid(long width, long size, Pointer *pointers) : pointers(pointers), count(0) {
    this->width = width;
    this->height = size / width;

    Pointer* invalid = nullptr;
    for (long long x = 0; x < size; ++x) {
        switch (pointers[x].getType()) {
            case VariableType::Array:
            case VariableType::Grid:
            case VariableType::Map:
                invalid = &pointers[x];
        }
    }
    if (invalid != nullptr) {
        delete[] pointers;

        throw simplex::ex_container_value(*invalid);
    }
}

Grid::~Grid() {
    delete[] pointers;
}

VariableType::VariableType Grid::getType() const {
    return VariableType::Grid;
}

Pointer Grid::getString() const {
    return s("Grid");
}

Double Grid::getBool() {
    return b(width + height > 0);
}

Value *Grid::reference() {
    count++;
    return this;
}

void Grid::deference() {
    if (--count <= 0) {
        delete this;
    }
}

Pointer& Grid::indexGrid(const Pointer &x, const Pointer &y) {
    if (!x.isNumber() || !y.isNumber()) {
        throw simplex::ex_grid_out_of_bounds(x, y);
    }

    long long w = simplex::to_int(x.getNumber());
    long long h = simplex::to_int(y.getNumber());
    if (w < 0 || w >= width || h < 0 || h >= height) {

        throw simplex::ex_grid_out_of_bounds(x, y);
    }

    return pointers[w + h * width];
}