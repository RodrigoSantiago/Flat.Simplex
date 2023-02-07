export class CopySystem {
    static trasnferenceOwner = null;
    static trasnference = {tag : "empty"};

    static copy(owner, trasnference) {
        if (CopySystem.trasnference) {
            CopySystem.trasnference.onLose?.(CopySystem.trasnference);
        }

        CopySystem.trasnferenceOwner = trasnference;
        CopySystem.trasnference = trasnference;
        return true;
    }

    static paste() {
        return CopySystem.trasnference;
    }

    static pasteDone() {
        if (CopySystem.trasnference && !CopySystem.trasnference.copy) {
            CopySystem.trasnference.onMove?.(CopySystem.trasnference);

            CopySystem.trasnferenceOwner = null
            CopySystem.trasnference = {tag : "empty"};
        }
    }

    static clear(owner) {
        if (!owner || CopySystem.trasnferenceOwner === owner) {
            CopySystem?.trasnference?.onLose(CopySystem.trasnference);

            CopySystem.trasnferenceOwner = null
            CopySystem.trasnference = {tag : "empty"};
        }
    }
}

export class CopyObject {

}