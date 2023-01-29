/**
 * Tab class hold configurations and the controller to a component used on {@link TabView}
 */
export class Tab {
    /** @type{string} */ name;
    /** @type{string} */ icon;
    /** @type{string} */ color;
    /** @type{TabController} */ controller;

    /** @type{JQuery} */ jqContent;
    /** @type{JQuery} */ jqTab;

    /**
     * Base constructor
     *
     * @param {string} name Tab Label's name
     * @param {string} icon Tab Label's icon name
     * @param {string} color Tab Label's css class for coloring
     * @param {TabController} controller Tab's class for receive the events
     */
    constructor(name, icon, color, controller) {
        this.name = name;
        this.icon = icon;
        this.color = color;
        this.controller = controller;
        this.jqContent = controller.getJqRoot();
    }
}