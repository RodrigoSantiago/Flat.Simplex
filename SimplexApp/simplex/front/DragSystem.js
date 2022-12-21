export class DragSystem {
    static draggedItem = null;

    static drag(item) {
        if (DragSystem.draggedItem !== null) {
            return false;
        }
        DragSystem.draggedItem = item;
        return true;
    }

    static drop(item) {
        if (DragSystem.draggedItem === item) {
            DragSystem.draggedItem = null;
        }
    }
}

window.addEventListener('click', function (e) {
    if (DragSystem.draggedItem !== null) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
});
window.addEventListener("dragstart", function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
});