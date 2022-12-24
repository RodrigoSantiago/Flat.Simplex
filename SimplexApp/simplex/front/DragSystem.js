export class DragSystem {
    static draggedItem = null;

    static drag(item) {
        if (DragSystem.draggedItem !== null) {
            return false;
        }
        DragSystem.draggedItem = item;
        return true;
    }
}
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && DragSystem.draggedItem !== null) {
        DragSystem.draggedItem.onDragCancel?.(event);
        DragSystem.draggedItem = null;
    }
});
window.addEventListener('mousemove', function (e) {
    if (DragSystem.draggedItem !== null) {
        DragSystem.draggedItem.onDragMove?.(e);
    }
});
window.addEventListener('mousemove', function (e) {
    if (DragSystem.draggedItem !== null) {
        DragSystem.draggedItem.onDragMove?.(e);
    }
});
window.addEventListener('mouseup', function (e) {
    if (DragSystem.draggedItem !== null) {
        DragSystem.draggedItem.onDragDrop?.(e);
        DragSystem.draggedItem = null;
    }
});
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