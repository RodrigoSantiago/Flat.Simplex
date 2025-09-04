
#include "Parse.h"

int32 Parse::Int32(const std::string& s) {
    try {
        size_t pos = 0;
        long val = std::stol(s, &pos, 10);
        if (pos != s.size()) {
            return 0;
        }
        return static_cast<int32>(val);
    } catch (const std::invalid_argument&) {
        return 0;
    } catch (const std::out_of_range&) {
        return 0;
    }
}

int64 Parse::Int64(const std::string& s) {
    try {
        size_t pos = 0;
        long long val = std::stoll(s, &pos, 10);
        if (pos != s.size()) {
            return 0;
        }
        return static_cast<int64>(val);
    } catch (const std::out_of_range&) {
        return 0;
    }
}

float Parse::Float(const std::string& s) {
    try {
        size_t pos = 0;
        float val = std::stof(s, &pos);
        if (pos != s.size()) {
            return 0.0f;
        }
        return val;
    } catch (const std::invalid_argument&) {
        return 0.0f;
    } catch (const std::out_of_range&) {
        return 0.0f;
    }
}

bool Parse::Bool(const std::string& s) {
    return s == "true";
}