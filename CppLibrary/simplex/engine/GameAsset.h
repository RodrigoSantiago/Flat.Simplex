//
// Created by Rodrigo on 03/09/2025.
//

#ifndef SIMPLEX_GAMEASSET_H
#define SIMPLEX_GAMEASSET_H

#include "../Base.h"
#include "../managed/Managed.h"

class GameAsset : public Managed {
public:
    int64 hashName;

    explicit GameAsset(Type type);
    ~GameAsset() override;
};


#endif //SIMPLEX_GAMEASSET_H
