/**
 * TabView split the same div across multiple contents. TabView uses two main parts : header and body. The Hader
 * contains the buttons to select the contents. The Body contains the content itself.
 */
export class TabView {

    /** @type{Tab[]} */ tabList = [];
    /** @type{Tab} */ selectedTab = null;
    /** @type{JQuery} */ jqLeftHandler = null;
    /** @type{JQuery} */ jqRightHandler = null;
    /** @type{JQuery} */ jqTopHeader = null;
    /** @type{JQuery} */ jqScroll = null;
    /** @type{JQuery} */ jqHeader = null;

    /**
     * Builds a TabView inside the given Header and Body elements
     *
     * @param {JQuery} jqHeader Header Div element
     * @param {JQuery} jqBody Body Div element
     */
    constructor(jqHeader, jqBody) {
        this.jqTopHeader = jqHeader;
        this.jqBody = jqBody;
        this.jqScroll = $('<div class="tab-scroll"></div>');
        this.jqHeader = $('<div class="tab-header"></div>');
        this.jqLeftHandler = $('<div class="left-handler hide"><i class="material-icons">keyboard_arrow_left</i></div>');
        this.jqRightHandler = $('<div class="right-handler hide"><i class="material-icons">keyboard_arrow_right</i></div>');
        this.jqScroll.append(this.jqHeader);
        this.jqTopHeader.append(this.jqScroll);
        this.jqTopHeader.append(this.jqLeftHandler);
        this.jqTopHeader.append(this.jqRightHandler);

        this.jqLeftHandler.on("click", (e) => {
            this.jqScroll.stop().animate({scrollLeft : this.jqScroll.scrollLeft() - 64}, 100);
        });
        this.jqRightHandler.on("click", (e) => {
            this.jqScroll.stop().animate({scrollLeft : this.jqScroll.scrollLeft() + 64}, 100);
        });
        this.jqScroll.scroll((e) => {
            this.#updateScroll();
        });
        this.jqScroll[0].addEventListener('wheel', (e) => {
            this.jqScroll.stop().scrollLeft(this.jqScroll.scrollLeft() + Math.sign(e.deltaY) * -30);
        });
    }

    /**
     * Fire Resize Events
     */
    onResize() {
        this.#updateScroll();
        if (this.selectedTab !== null) {
            this.selectedTab.controller.onResize();
        }
    }

    /**
     * Add and select a Tab on the TabView
     *
     * @param {Tab} tab Tab to be added
     */
    addTab(tab) {
        tab.jqTab = $(
            "<div class='tab-page " + tab.color + "'>" +
            "<i class='material-icons'>" + tab.icon + "</i><span class='tab-title'>" + tab.name + "</span>" +
            "<div class='tab-close no-ripple'><i class='material-icons'>close</i></div>" +
            "</div>"
        );
        tab.jqTab.on("click", (e) => {
            this.selectTab(tab);
        });
        tab.jqTab.find(".tab-close").on("click", (e) => {
            tab.controller.onClose(tab);
        });
        this.jqHeader.append(tab.jqTab);
        this.tabList.push(tab);
        this.selectTab(tab);
    }

    /**
     * Remove a Tab from the TabView. Select the next or the last
     *
     * @param {Tab} tab Tab to be removed
     */
    removeTab(tab) {
        if (this.selectedTab === tab) {
            let index = this.tabList.indexOf(tab);
            if (this.tabList.length > 0) {
                this.selectTab(this.tabList[Math.max(this.tabList.length - 1, index)]);
            } else {
                this.selectTab(null);
            }
        }
        tab.controller.onRemove();

        tab.jqTab.remove();
        tab.jqContent.remove();
        let index = this.tabList.indexOf(tab);
        this.tabList.splice(index, 1);
        this.onResize();
    }

    /**
     * Select a Tab on the TabView. Using null value results in an clear body
     *
     * @param {Tab} tab Tab to be selected
     */
    selectTab(tab) {
        if (this.selectedTab !== tab) {
            if (this.selectedTab !== null) {
                this.selectedTab.jqTab.removeClass("selected");
                this.selectedTab.controller.onHide();
                this.selectedTab.jqContent.detach();
            }
            this.selectedTab = tab;
            if (tab) {
                tab.jqTab.addClass("selected");
                this.jqBody.append(tab.jqContent);
                tab.controller.onShow();
            }
        }
        if (tab) {
            tab.jqTab[0].scrollIntoView();
        }
        this.onResize();
    }

    #updateScroll() {
        if (this.jqScroll.scrollLeft() <= 16) {
            this.jqLeftHandler.addClass("hide");
        } else {
            this.jqLeftHandler.removeClass("hide");
        }

        if (this.jqScroll.scrollLeft() >= this.jqScroll[0].scrollWidth - this.jqScroll.width() - 16) {
            this.jqRightHandler.addClass("hide");
        } else {
            this.jqRightHandler.removeClass("hide");
        }
    }
}