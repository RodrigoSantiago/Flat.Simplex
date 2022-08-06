package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.parser.logic.line.LineValue;

public class CallValue extends LineCall {

    private Double doubleValue;
    private String strValue;

    public CallValue(Block parent, Token token) {
        super(parent, token, Type.Value);
    }

    @Override
    public void load() {
        if (getToken().getKey() == Key.String) {
            String string = getToken().getString();
            if (!string.endsWith(string.substring(0, 1))) {
                strValue = string.substring(1);
                getContext().error(getToken(), Error.lineIncorrectlyFormatted);
            } else {
                strValue = string.substring(1, string.length() - 1);
            }
        } else if (getToken().getKey() == Key.Number) {
            try {
                doubleValue = Double.parseDouble(getToken().getString());
            } catch (Exception e) {
                doubleValue = 0.0d;
                getContext().error(getToken(), Error.lineIncorrectlyFormatted);
            }
        }
    }

    public Double getDoubleValue() {
        return doubleValue;
    }

    public String getStrValue() {
        return strValue;
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
