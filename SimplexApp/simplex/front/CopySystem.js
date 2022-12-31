export class CopySystem {
    static trasnferenceOwner = null;
    static trasnference = {tag : "empty"};
    static move = false;

    static copy(owner, trasnference, move = false) {
        CopySystem.trasnferenceOwner = trasnference;
        CopySystem.trasnference = trasnference;
        CopySystem.move = move;
        return true;
    }

    static paste() {
        return CopySystem.trasnference;
    }

    static pasteDone() {
        if (CopySystem.move && CopySystem.trasnference) {
            CopySystem.trasnference?.onMove(CopySystem.trasnference);
            CopySystem.trasnferenceOwner = null
            CopySystem.trasnference = {tag : "empty"};
        }
    }

    static clear(owner) {
        if (!owner || CopySystem.trasnferenceOwner === owner) {
            CopySystem.trasnferenceOwner = null
            CopySystem.trasnference = {tag : "empty"};
        }
    }
}