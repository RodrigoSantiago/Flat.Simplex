export class Tab {
    name;
    icon;
    color;
    closeEvent;

    jqTab;
    jqContent;

    constructor(name, icon, color, closeEvent, jqContent) {
        this.name = name;
        this.icon = icon;
        this.color = color;
        this.closeEvent = closeEvent;
        this.jqContent = jqContent;
    }
}

export class TabView {

    selectedTab = null;
    tabList = [];
    jqLeftHandler = null;
    jqRightHandler = null;

    constructor(jqHeader, jqBody) {
        const self = this;
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

        this.jqLeftHandler.click(function (e) {
            self.jqScroll.stop().animate({scrollLeft : self.jqScroll.scrollLeft() - 64}, 100);
        });
        this.jqRightHandler.click(function (e) {
            self.jqScroll.stop().animate({scrollLeft : self.jqScroll.scrollLeft() + 64}, 100);
        });
        this.jqScroll.scroll(function (e) {
            self.updateScroll();
        });
        this.jqScroll[0].addEventListener('wheel', function(e){
            self.jqScroll.stop().scrollLeft(self.jqScroll.scrollLeft() + Math.sign(e.deltaY) * -30);
        });
    }

    onResize() {
        this.updateScroll();
        if (this.selectedTab !== null) {
            this.selectedTab.jqContent.onResize?.();
        }
    }

    updateScroll() {
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

    addTab(tab) {
        const self = this;
        tab.jqTab = $(
            "<div class='tab-page " + tab.color + "'>" +
            "<i class='material-icons'>" + tab.icon + "</i><span class='tab-title'>" + tab.name + "</span>" +
            "<div class='tab-close no-ripple'><i class='material-icons'>close</i></div>" +
            "</div>"
        );
        tab.jqTab.on("click", function (e) {
            self.selectTab(tab);
        });
        tab.jqTab.find(".tab-close").on("click", function (e) {
            tab.closeEvent?.(tab);
        });
        this.jqHeader.append(tab.jqTab);
        this.tabList.push(tab);
        this.selectTab(tab);
    }

    removeTab(tab) {
        if (this.selectedTab === tab) {
            let index = this.tabList.indexOf(tab);
            if (this.tabList.length > 0) {
                this.selectTab(this.tabList[Math.max(this.tabList.length - 1, index)]);
            } else {
                this.selectTab(null);
            }
        }
        tab.jqContent.onRemove?.();

        tab.jqTab.remove();
        tab.jqContent.remove();
        let index = this.tabList.indexOf(tab);
        this.tabList.splice(index, 1);
        this.onResize();
    }

    selectTab(tab) {
        if (this.selectedTab !== tab) {
            if (this.selectedTab !== null) {
                this.selectedTab.jqTab.removeClass("selected");
                this.selectedTab.jqContent.onHide?.();
                this.selectedTab.jqContent.detach();
            }
            this.selectedTab = tab;
            if (tab) {
                tab.jqTab.addClass("selected");
                this.jqBody.append(tab.jqContent);
                tab.jqContent.onShow?.();
            }
        }
        if (tab) {
            this.scrollToTab(tab);
        }
        this.onResize();
    }

    scrollToTab(tab) {
        if (tab) {
            tab.jqTab[0].scrollIntoView();
        }
    }
}