/**
 * TabController is a prototype class to be used on {@link Tab}, to receive the {@link TabView} events
 */
export class TabController {

    /** @type{*} */ content;
    /** @type{Function} */ close;

    /**
     * Base constructor
     *
     * @param{*} content The content to identify the tab
     */
    constructor(content) {
        this.content = content;
    }

    /**
     * Fired when the tab is created or selected
     */
    onShow() {
    }

    /**
     * Fired when the tab is unselected
     */
    onHide() {
    }

    /**
     * Fired when the editor change it's size
     */
    onResize() {
    }

    /**
     * Fired when the close button is clicked
     */
    onClose() {
    }

    /**
     * Fired when the editor is removed from the TabView
     */
    onRemove() {
    }

    /**
     * The root element from the body
     *
     * @returns {JQuery} The root element from the body
     */
    getJqRoot() {
        return null;
    }
}