export interface ScanData {
    integrity: {
        instance_exist: boolean,
        instance_path: string,
        manifest_exist: boolean,
        manifest_path: string
    },
}

export interface CheckedScanData extends ScanData {
    info: {
        name: string,
        version: string,
        loader: string
    }
}
