class Key {
    constructor (name, operatorType) {
        this.name = name;
        this.op = operatorType ? operatorType : 0;
    }

    static hashCode(str, start, end) {
        if (!start) start = 0;
        if (!end) end = str.length;

        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = start; i < end; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return hash;
    }

    static readKey(source, start, end) {
        if (Key.keys === null) {
            Key.keys = new Map();
            for (const [name, value] of Object.entries(Key)) {
                if (value instanceof Key && name.length > 0) {
                    Key.keys[Key.hashCode(value.name)] = value;
                }
            }
        }
        let key = Key.keys[Key.hashCode(source, start, end)];
        return key ? key : null;
    }
}

Key.Invalid = new Key('');
Key.Word = new Key('');
Key.String = new Key('');
Key.Number = new Key('');
Key.If = new Key('if');
Key.Else = new Key('else');
Key.Switch = new Key('switch');
Key.Case = new Key('case');
Key.Default = new Key('default');
Key.While = new Key('while');
Key.For = new Key('for');
Key.Do = new Key('do');
Key.Break = new Key('break');
Key.Continue = new Key('continue');
Key.Return = new Key('return');
Key.With = new Key('with');
Key.Var = new Key('var');
Key.Function = new Key('function');
Key.Undefined = new Key('undefined');
Key.True = new Key('true');
Key.False = new Key('false');
Key.Global = new Key('global');
Key.This = new Key('this');
Key.Brace = new Key('{');
Key.CBrace = new Key('}');
Key.Param = new Key('(');
Key.CParam = new Key(')');
Key.Index = new Key('[');
Key.CIndex = new Key(']');
Key.Dot = new Key('.');
Key.Comma = new Key(',');
Key.Semicolon = new Key(';');
Key.Colon = new Key(':', 12);
Key.Quest = new Key('?', 12);
Key.Add = new Key('+', 3);
Key.Sub = new Key('-', 3);
Key.Mul = new Key('*', 2);
Key.Div = new Key('/', 2);
Key.Mod = new Key('%', 2);
Key.Sfl = new Key('<<', 4);
Key.Sfr = new Key('>>', 4);
Key.Inc = new Key('++', 1);
Key.Dec = new Key('--', 1);
Key.Not = new Key('!', 1);
Key.Bnot = new Key('~', 1);
Key.Set = new Key('=', 13);
Key.Setadd = new Key('+=', 13);
Key.Setsub = new Key('-=', 13);
Key.Setmul = new Key('*=', 13);
Key.Setdiv = new Key('/=', 13);
Key.Setmod = new Key('%=', 13);
Key.Setsfl = new Key('<<=', 13);
Key.Setsfr = new Key('>>=', 13);
Key.Eq = new Key('==', 6);
Key.Dif = new Key('!=', 6);
Key.Gr = new Key('>', 5);
Key.Gre = new Key('>=', 5);
Key.Ls = new Key('<', 5);
Key.Lse = new Key('<=', 5);
Key.Band = new Key('&', 7);
Key.Bxor = new Key('^', 8);
Key.Bor = new Key('|', 9);
Key.And = new Key('&&', 10);
Key.Or = new Key('||', 11);
Key.Hex = new Key('#');
Key.keys = null;

module.exports = Key;