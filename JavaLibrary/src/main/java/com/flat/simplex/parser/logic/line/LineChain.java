package com.flat.simplex.parser.logic.line;

import com.flat.simplex.parser.logic.line.call.LineCall;

public class LineChain extends LineValue {

    protected LineCall firstCall;
    protected LineCall lastCall;

    public LineChain(LineCall firstCall) {
        super(firstCall.getParent(), firstCall.getToken());
        this.firstCall = firstCall;
        LineCall call = firstCall;
        while (call != null) {
            lastCall = call;
            call.load();
            call = call.getNext();
        }
    }

    @Override
    public LineCall getFirstCall() {
        return firstCall;
    }

    @Override
    public LineCall getLastCall() {
        return lastCall;
    }

    @Override
    public ReturnType getReturnType() {
        if (lastCall != null && lastCall.getType() == LineCall.Type.Value) {
            return lastCall.getReturnType();
        }
        return super.getReturnType();
    }

    @Override
    public String toString() {
        StringBuilder str = new StringBuilder();
        LineCall call = firstCall;
        while (call != null) {
            if (call.getType() == LineCall.Type.Field && call != firstCall) str.append(".");
            str.append(call);
            call = call.getNext();
        }
        return str.toString();
    }
}
