class Field {
    constructor(tokenSource, name, type) {
        this.tokenSource = tokenSource;
        this.name = name;
        this.type = type;
        this.argumentId = 0;
    }

    getName() {
        return this.name;
    }

    getArgumentId() {
        return this.argumentId;
    }

    getTokenSource() {
        return this.tokenSource;
    }
}
Field.Local = 'Local';
Field.Instance = 'Instance';
Field.Parameter = 'Parameter';

module.exports = Field;