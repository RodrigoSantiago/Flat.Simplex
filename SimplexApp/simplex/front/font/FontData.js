export class FontData {
    constructor(name) {
        this.name = name;
        this.style = [];
    }

    addStyle(style) {
        this.style.push(style);
    }
}