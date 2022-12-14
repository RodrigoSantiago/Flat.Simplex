export function HideOnClickOutside(selector, call) {
    const outsideClickListener = (event) => {
        const $target = $(event.target);
        if (!$target.closest(selector).length) {
            call(selector);
            removeClickListener();
        }
    }

    const removeClickListener = () => {
        document.removeEventListener('mousedown', outsideClickListener);
    }

    document.addEventListener('mousedown', outsideClickListener);
}

export function DismissClickResize(jqObj, onDismiss, autoremove = true) {
    const outsideClickListener = (event) => {
        const $target = $(event.target);
        if (!$target.closest(jqObj).length) {
            onDismiss(jqObj);
            if (autoremove) removeClickListener();
        }
    }
    const resizeListener = (event) => {
        const $target = $(event.target);
        if (!$target.closest(jqObj).length) {
            onDismiss(jqObj);
            if (autoremove) removeClickListener();
        }
    }

    const removeClickListener = () => {
        document.removeEventListener('mousedown', outsideClickListener);
        document.removeEventListener('resize', resizeListener);
    }

    document.addEventListener('mousedown', outsideClickListener);
    window.addEventListener('resize', resizeListener);

    return removeClickListener;
}