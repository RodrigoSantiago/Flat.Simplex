package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.parser.logic.line.LineValue;

public class CallValue extends LineCall {

    private Double doubleValue;
    private String strValue;
    private Boolean boolValue;

    public CallValue(Block parent, Token token) {
        super(parent, token, Type.Value);
    }

    @Override
    public void load() {
        if (getToken().getKey() == Key.String) {
            String string = getToken().getString();
            int chr;
            int init = 0;
            boolean endOk = false;
            boolean invert = false;
            for (int i = 0; i < string.length(); i += Character.charCount(chr)) {
                chr = string.codePointAt(i);
                if (endOk) {
                    endOk = false;
                    break;
                } else if (i == 0) {
                    init = chr;
                } else if (chr == '\\') {
                    invert = !invert;
                } else if (chr == init && !invert) {
                    endOk = true;
                }
            }

            if (!endOk) {
                strValue = "";
                getContext().error(getToken(), Error.lineIncorrectlyFormatted);
            } else {
                strValue = string.substring(1, string.length() - 1);
            }
        } else if (getToken().getKey() == Key.Number) {
            doubleValue = 0.0d;
            try {
                if (getToken().getString().startsWith("#")) { // # 12 34 56 78
                    if (getToken().getLength() <= 9) {
                        doubleValue = Double.longBitsToDouble(Long.parseLong(getToken().getString().substring(1), 16));
                    } else {
                        getContext().error(getToken(), Error.lineIncorrectlyFormatted);
                    }
                } else {
                    doubleValue = Double.parseDouble(getToken().getString());
                }
            } catch (Exception e) {
                getContext().error(getToken(), Error.lineIncorrectlyFormatted);
            }
        } else if (getToken().getKey() == Key.True) {
            boolValue = Boolean.TRUE;
        } else if (getToken().getKey() == Key.False) {
            boolValue = Boolean.FALSE;
        } else if (getToken().getKey() == Key.Undefined) {
            doubleValue = Double.NaN;
        }
    }

    public Double getDoubleValue() {
        return doubleValue;
    }

    public String getStrValue() {
        return strValue;
    }

    public Boolean getBoolValue() {
        return boolValue;
    }

    @Override
    public void setNext(LineCall next) {
        super.setNext(next);
        getContext().error(next.getToken(), Error.lineUnexpectedCall);
    }

    @Override
    public LineValue.ReturnType getReturnType() {
        return getToken().getKey() == Key.String ? LineValue.ReturnType.String :
                getToken().getKey() == Key.Undefined ? LineValue.ReturnType.Object : LineValue.ReturnType.Double;
    }

    @Override
    public String toString() {
        return "" + getToken();
    }
}
