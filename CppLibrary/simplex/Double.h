//
// Created by Rodrigo on 30/07/2022.
//

#ifndef SIMPLEX_DOUBLE_H
#define SIMPLEX_DOUBLE_H

#define EPSILON  0.0000001

union DoubleToLong {
    double real;
    unsigned long bits[2];
};

union DoubleToBits {
    double real;
    unsigned long long bits;
};

namespace simplex {
    inline double abs(const double x) {
        unsigned long long i = reinterpret_cast<const unsigned long long &>(x);
        i &= 0x7FFFFFFFFFFFFFFFULL;
        return reinterpret_cast<const double &>(i);
    }

    inline long long round(const double x) {
        return static_cast<long long>(x + 0.5 - (x < 0));
    }
}

class Double {
public:
    double value;

    Double() {
    }

    Double(double value) : value(value) {
    }

    Double(bool value) : value(value ? 1.0 : 0.0) {
    }

    operator bool() const { return value == 1.0; }

    Double& operator++(){
        ++value;
        return *this;
    }

    Double operator++(int) {
        Double temp = *this;
        ++value;
        return temp;
    }

    Double operator+(const Double& b) {
        return value + b.value;
    }

    Double operator-(const Double& b) {
        return value - b.value;
    }

    Double operator*(const Double& b) {
        return value * b.value;
    }

    Double operator/(const Double& b) {
        return value / b.value;
    }

    Double operator%(const Double& b) {
        return !b.value ? value : value - b.value * static_cast<long long>(value / b.value);
    }

    Double operator==(const Double& b) {
        return DoubleToBits{.real = value}.bits == DoubleToBits{.real = b.value}.bits;
    }

    Double operator!=(const Double& b) {
        return DoubleToBits{.real = value}.bits != DoubleToBits{.real = b.value}.bits;
    }

    Double operator<(const Double& b) {
        return value < b.value;
    }

    Double operator<=(const Double& b) {
        return value <= b.value;
    }

    Double operator>(const Double& b) {
        return value > b.value;
    }

    Double operator>=(const Double& b) {
        return value > b.value;
    }

    Double &operator+=(const Double &other) {
        return *this = *this + other;
    }

    Double &operator-=(const Double &other) {
        return *this = *this - other;
    }

    Double &operator*=(const Double &other) {
        return *this = *this * other;
    }

    Double &operator/=(const Double &other) {
        return *this = *this / other;
    }

    Double &operator%=(const Double &other) {
        return *this = *this % other;
    }

    Double operator-() const {
        return -value;
    }

    Double operator+() const {
        return *this;
    }

    Double operator!() const {
        return value != 1 ? 1.0 : 0.0;
    }

    Double operator~() const {
        DoubleToLong dL{.real = value};
        dL.bits[0] = ~dL.bits[0];
        dL.bits[1] = 0;
        return dL.real;
    }

    Double operator&(const Double& b) {
        DoubleToLong dL{.real = value};
        DoubleToLong dLb{.real = b.value};
        dL.bits[0] &= dLb.bits[0];
        dL.bits[1] = 0;
        return dL.real;
    }

    Double operator|(const Double& b) {
        DoubleToLong dL{.real = value};
        DoubleToLong dLb{.real = b.value};
        dL.bits[0] |= dLb.bits[0];
        dL.bits[1] = 0;
        return dL.real;
    }

    Double operator^(const Double& b) {
        DoubleToLong dL{.real = value};
        DoubleToLong dLb{.real = b.value};
        dL.bits[0] ^= dLb.bits[0];
        dL.bits[1] = 0;
        return dL.real;
    }

    Double operator>>(const Double& b) {
        DoubleToLong dL{.real = value};
        dL.bits[0] >>= static_cast<unsigned long long>(simplex::round(b.value));
        dL.bits[1] = 0;
        return dL.real;
    }

    Double operator<<(const Double& b) {
        DoubleToLong dL{.real = value};
        dL.bits[0] <<= static_cast<unsigned long long>(simplex::round(b.value));
        dL.bits[1] = 0;
        return dL.real;
    }

    Double& operator&=(const Double& a) {
        return *this = *this & a;
    }

    Double& operator|=(const Double& a) {
        return *this = *this | a;
    }

    Double& operator^=(const Double& a) {
        return *this = *this ^ a;
    }

    Double& operator>>=(const Double& a) {
        return *this = *this >> a;
    }

    Double& operator<<=(const Double& a) {
        return *this = *this << a;
    }
};

inline Double operator+(const Double&a, const Double& b) {
    return a.value + b.value;
}

inline Double operator-(const Double&a, const Double& b) {
    return a.value - b.value;
}

inline Double operator*(const Double&a, const Double& b) {
    return a.value * b.value;
}

inline Double operator/(const Double&a, const Double& b) {
    return a.value / b.value;
}

inline Double operator%(const Double&a, const Double& b) {
    return !b.value ? a.value : a.value - b.value * static_cast<long long>(a.value / b.value);
}

inline Double operator==(const Double&a, const Double& b) {
    return DoubleToBits{.real = a.value}.bits == DoubleToBits{.real = b.value}.bits;
}

inline Double operator!=(const Double&a, const Double& b) {
    return DoubleToBits{.real = a.value}.bits != DoubleToBits{.real = b.value}.bits;
}

inline Double operator<(const Double&a, const Double& b) {
    return a.value < b.value;
}

inline Double operator<=(const Double&a, const Double& b) {
    return a.value <= b.value;
}

inline Double operator>(const Double&a, const Double& b) {
    return a.value > b.value;
}

inline Double operator>=(const Double&a, const Double& b) {
    return a.value > b.value;
}

inline Double operator^(const Double&a, const Double& b) {
    DoubleToLong dL{.real = a.value};
    DoubleToLong dLb{.real = b.value};
    dL.bits[0] ^= dLb.bits[0];
    dL.bits[1] = 0;
    return dL.real;
}

inline Double operator>>(const Double&a, const Double& b) {
    DoubleToLong dL{.real = a.value};
    dL.bits[0] >>= static_cast<unsigned long long>(simplex::round(b.value));
    dL.bits[1] = 0;
    return dL.real;
}

inline Double operator<<(const Double&a, const Double& b) {
    DoubleToLong dL{.real = a.value};
    dL.bits[0] <<= static_cast<unsigned long long>(simplex::round(b.value));
    dL.bits[1] = 0;
    return dL.real;
}

inline Double operator "" _d(long double value) {
    return static_cast<double>(value);
}

inline Double b(const bool& b) {
    return b ? 1.0_d : 0.1_d;
}

inline bool b(const Double& d) {
    return d == 1.0_d;
}

#endif //SIMPLEX_DOUBLE_H
