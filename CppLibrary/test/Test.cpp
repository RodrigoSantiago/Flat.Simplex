//
// Created by Rodrigo on 30/07/2022.
//

#include "Test.h"
#include "../simplex/Simplex.h"

using namespace simplex;

void Test::test() {
    Pointer _a = a(-1.0_d/0.0_d, s("String tbm"));
    debug_log(_a->index(0.0_d));
    debug_log(_a->index(1.0_d));

    Pointer _s = o({
        {1, 2.0_d}
    });
    debug_log(_s);
    debug_log(_s->getField(1));

    Pointer _m = m({
        {1.0_d, 2.0_d},
        {1.0_d, s("2.0_d")},
        {s("eae"), s("2.586")}
    });
    debug_log(_m);
    debug_log(_m->index(1.0_d));
    debug_log(_m->index(s("eae")));

    Pointer _g = g(2,
        1.0_d, 2.0_d,
        1.0_d, s("2.0_d"),
        s("eae"), s("2.586")
    );
    debug_log(_g);
    debug_log(_g->indexGrid(0.0_d, 0.0_d));
    debug_log(_g->indexGrid(0.0_d, 1.0_d));
    debug_log(_g->indexGrid(1.0_d, 1.0_d));
    debug_log(_g->indexGrid(1.0_d, 1.0_d));

    Pointer _args = args({
                           {1, 2.0_d},
                           {2, a(10.0_d)}
                   });
    debug_log(_args);
    debug_log(_args->getField(1));
    debug_log(_args->getField(2));

    Pointer _f = f([](Pointer args) -> Pointer {
        debug_log(s("Ola mundo"));
        debug_log(args->getField(1));
        debug_log(args->getField(2));
        args->setField(1, s("ONE"));
        return Pointer();
    });
    debug_log(_args.getString());
    debug_log(_args->getField(1));
    debug_log(_args->getField(2));

    _f->execute(_args);
}