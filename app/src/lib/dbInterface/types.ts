export type DB = {
    id: string,
    value: IDBDatabase
}

export enum DBTypes {
    localImages = "localImages",
    nativeImages = "nativeImages"
}
