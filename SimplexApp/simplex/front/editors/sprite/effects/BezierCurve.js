const pi = 3.14159265359;

const collinearity_epsilon = 1e-30;
const angle_epsilon = 0.01;

const m_angle = 0;
const m_cusp = 0;
const m_level = 32;

function distance2(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return dx * dx + dy * dy;
}

function cubic(m_distance,
    x1, y1,
    x2, y2,
    x3, y3,
    x4, y4,
    level, vertex) {
    if (level > m_level) {
        return;
    }

    let x12 = (x1 + x2) / 2;
    let y12 = (y1 + y2) / 2;
    let x23 = (x2 + x3) / 2;
    let y23 = (y2 + y3) / 2;
    let x34 = (x3 + x4) / 2;
    let y34 = (y3 + y4) / 2;
    let x123 = (x12 + x23) / 2;
    let y123 = (y12 + y23) / 2;
    let x234 = (x23 + x34) / 2;
    let y234 = (y23 + y34) / 2;
    let x1234 = (x123 + x234) / 2;
    let y1234 = (y123 + y234) / 2;

    let dx = x4 - x1;
    let dy = y4 - y1;

    let d2 = Math.abs(((x2 - x4) * dy - (y2 - y4) * dx));
    let d3 = Math.abs(((x3 - x4) * dy - (y3 - y4) * dx));
    let da1, da2, k;

    switch (((d2 > collinearity_epsilon ? 1 : 0) << 1) + (d3 > collinearity_epsilon ? 1 : 0)) {
        case 0:
            k = dx * dx + dy * dy;
            if (k === 0) {
                d2 = distance2(x1, y1, x2, y2);
                d3 = distance2(x4, y4, x3, y3);
            } else {
                k = 1 / k;
                da1 = x2 - x1;
                da2 = y2 - y1;
                d2 = k * (da1 * dx + da2 * dy);
                da1 = x3 - x1;
                da2 = y3 - y1;
                d3 = k * (da1 * dx + da2 * dy);
                if (d2 > 0 && d2 < 1 && d3 > 0 && d3 < 1) {
                    return;
                }
                if (d2 <= 0) {
                    d2 = distance2(x2, y2, x1, y1);
                } else if (d2 >= 1) {
                    d2 = distance2(x2, y2, x4, y4);
                } else {
                    d2 = distance2(x2, y2, x1 + d2 * dx, y1 + d2 * dy);
                }

                if (d3 <= 0) {
                    d3 = distance2(x3, y3, x1, y1);
                } else if (d3 >= 1) {
                    d3 = distance2(x3, y3, x4, y4);
                } else {
                    d3 = distance2(x3, y3, x1 + d3 * dx, y1 + d3 * dy);
                }
            }
            if (d2 > d3) {
                if (d2 < m_distance) {
                    vertex(x2, y2);
                    return;
                }
            } else {
                if (d3 < m_distance) {
                    vertex(x3, y3);
                    return;
                }
            }
            break;

        case 1:
            if (d3 * d3 <= m_distance * (dx * dx + dy * dy)) {
                if (m_angle < angle_epsilon) {
                    vertex(x23, y23);
                    return;
                }

                da1 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2));
                if (da1 >= pi) da1 = 2 * pi - da1;

                if (da1 < m_angle) {
                    vertex(x2, y2);
                    vertex(x3, y3);
                    return;
                }

                if (m_cusp !== 0.0) {
                    if (da1 > m_cusp) {
                        vertex(x3, y3);
                        return;
                    }
                }
            }
            break;
        case 2:
            if (d2 * d2 <= m_distance * (dx * dx + dy * dy)) {
                if (m_angle < angle_epsilon) {
                    vertex(x23, y23);
                    return;
                }

                da1 = fabs(atan2(y3 - y2, x3 - x2) - atan2(y2 - y1, x2 - x1));
                if (da1 >= pi) da1 = 2 * pi - da1;

                if (da1 < m_angle) {
                    vertex(x2, y2);
                    vertex(x3, y3);
                    return;
                }

                if (m_cusp !== 0.0) {
                    if (da1 > m_cusp) {
                        vertex(x2, y2);
                        return;
                    }
                }
            }
            break;
        case 3:
            if ((d2 + d3) * (d2 + d3) <= m_distance * (dx * dx + dy * dy)) {
                if (m_angle < angle_epsilon) {
                    vertex(x23, y23);
                    return;
                }

                k = Math.atan2(y3 - y2, x3 - x2);
                da1 = Math.abs(k - Math.atan2(y2 - y1, x2 - x1));
                da2 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - k);
                if (da1 >= pi) da1 = 2 * pi - da1;
                if (da2 >= pi) da2 = 2 * pi - da2;

                if (da1 + da2 < m_angle) {
                    vertex(x23, y23);
                    return;
                }

                if (m_cusp !== 0.0) {
                    if (da1 > m_cusp) {
                        vertex(x2, y2);
                        return;
                    }

                    if (da2 > m_cusp) {
                        vertex(x3, y3);
                        return;
                    }
                }
            }
            break;
    }
    cubic(m_distance, x1, y1, x12, y12, x123, y123, x1234, y1234, level + 1, vertex);
    cubic(m_distance, x1234, y1234, x234, y234, x34, y34, x4, y4, level + 1, vertex);
}

function tessCubic(scale,
    x1, y1,
    x2, y2,
    x3, y3,
    x4, y4,
    vertex) {
    vertex(x1, y1);
    scale = 1 / ((scale) * (scale));
    cubic(scale, x1, y1, x2, y2, x3, y3, x4, y4, 0, vertex);
    vertex(x4, y4);
}

export class BezierCurve {
    static drawBezier(x1, y1, x2, y2, x3, y3, x4, y4, func) {
        tessCubic(1, x1, y1, x2, y2, x3, y3, x4, y4, func);
    }
}