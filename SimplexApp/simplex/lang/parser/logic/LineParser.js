var LineReader, LineBinder;

class LineParser {
    constructor(parent, token, end) {
        this.parent = parent;
        this.token = token;
        this.end = end;
    }
    parse() {
        let reader = new LineReader(this.parent);
        let binder = new LineBinder(this.parent, this.token);
        return binder.bind(reader.read(this.token, this.end));
    }
}

module.exports = LineParser;
LineReader = require("simplex/lang/parser/logic/LineReader.js");
LineBinder = require("simplex/lang/parser/logic/LineBinder.js");