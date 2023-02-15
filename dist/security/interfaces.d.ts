export interface ISecureItem {
    /**
     * creator / owner of the item
     */
    readonly creator: string;
    /**
     * group he is sharing this item
     */
    readonly group?: string;
    /**
     * detailed permissions, by default 744
     */
    readonly permissions?: number;
    /**
     * group of users with special rights, once buddies which e.g. should have write access, too
     */
    readonly buddies?: string[];
}
export interface IUser {
    /**
     * user name
     */
    readonly name: string;
    /**
     * list of roles the user is associated with
     */
    readonly roles: string[];
}
export interface IUserStore<T extends Record<string, any> = Record<string, any>> {
    id: string;
    ui: string | null;
    configuration: T;
}
//# sourceMappingURL=interfaces.d.ts.map