export class UserUtils {
}
UserUtils.ANONYMOUS_USER = { name: 'anonymous', roles: ['anonymous'] };
export var EPermission;
(function (EPermission) {
    EPermission[EPermission["READ"] = 4] = "READ";
    EPermission[EPermission["WRITE"] = 2] = "WRITE";
    EPermission[EPermission["EXECUTE"] = 1] = "EXECUTE";
})(EPermission || (EPermission = {}));
export var EEntity;
(function (EEntity) {
    EEntity[EEntity["USER"] = 0] = "USER";
    EEntity[EEntity["GROUP"] = 1] = "GROUP";
    EEntity[EEntity["OTHERS"] = 2] = "OTHERS";
    EEntity[EEntity["BUDDIES"] = 3] = "BUDDIES";
})(EEntity || (EEntity = {}));
//# sourceMappingURL=constants.js.map