import {SpriteMenu} from "./SpriteMenu.js";
import {SpriteFrameView} from "./SpriteFrameView.js";
import {SpriteFrame} from "../SpriteFrame.js";

export class SpriteMenuFrames extends SpriteMenu {

    /** @type{SpriteFrameView[]} */ frames = [];
    /** @type{SpriteFrameView} */ selectedFrame = null;

    constructor(editor, jqDragView, dockeable) {
        super(editor, jqDragView, dockeable);
        this.jqContainer = jqDragView.find(".frames-container");
        this.jqAddBtn = jqDragView.find(".frame-add");

        this.jqAddBtn.click((e) => this.editor.frameAdd());
    }

    /**
     * Add a visual item for the given frame
     *
     * @param sprFrame {SpriteFrame} Frame to be shown
     * @param index {number} Optional position index
     * @returns {SpriteFrameView} The created item
     */
    frameAdd(sprFrame, index) {
        let frame = new SpriteFrameView(this.editor, sprFrame);
        if (index === undefined) {
            this.frames.push(frame);
            this.jqContainer.append(frame.jqFrameBtn);
        } else {
            this.frames.splice(index + 1, 0, frame);
            this.layers[index].jqLayerBtn.after(frame.jqLayerBtn);
        }
        return frame;
    }

    /**
     * Remove the given frame or FrameView
     *
     * @param frame {SpriteFrameView | SpriteFrame}
     */
    frameRemove(frame) {
        let index = this.indexOf(frame);
        this.frames[index].jqFrameBtn.remove();
        this.frames.splice(index, 1);
    }

    /**
     * Moves the frameA to be before frameB. If frame B is null, the frameA goes to last position
     *
     * @param frameA {SpriteFrameView | SpriteFrame}
     * @param frameB {SpriteFrameView | SpriteFrame}
     */
    frameMove(frameA, frameB) {
        let indexA = this.indexOf(frameA);
        this.frames.splice(indexA, 1);
        if (!frameB) {
            frameA.jqFrameBtn.detach();
            this.jqContainer.append(frameA.jqFrameBtn);
            this.frames.push(frameA);

        } else {
            let indexB = this.indexOf(frameB);
            this.frames.splice(indexB, 0, frameA);

            frameA.jqFrameBtn.detach();
            frameB.jqFrameBtn.before(frameA.jqFrameBtn);
        }

        this.resetZIndex();
    }

    /**
     * Stylize the selected frame
     *
     * @param frame {SpriteFrameView | SpriteFrame} Layer to be selected
     */
    frameSelect(frame) {
        frame = this.getFrame(frame);
        if (this.selectedFrame !== null) {
            this.selectedFrame.jqFrameBtn.removeClass("selected");
        }
        this.selectedFrame = frame;
        this.selectedFrame.jqFrameBtn.addClass("selected");
    }

    getFrame(frame) {
        return this.frames[this.indexOf(frame)]
    }
    
    indexOf(frame) {
        if (frame instanceof SpriteFrameView) {
            return  this.frames.indexOf(frame);

        } else if (frame instanceof SpriteFrame) {
            for (let i = 0; i < this.frames.length; i++) {
                if (this.frames[i].frame === frame) {
                    return i;
                }
            }

        }
        return -1;
    }
}