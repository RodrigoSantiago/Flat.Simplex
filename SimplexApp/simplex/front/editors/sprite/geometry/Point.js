/**
 * Generic pseudo class for 2d point
 */
export class Point {

    /** @type {number} */ x;
    /** @type {number} */ y;

    /**
     * Base constructor
     *
     * @param x X coordinate
     * @param y Y coordinate
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}