import { ref } from "hywer/jsx-runtime";
import { CheckedScanData, ScanData } from "./types";


class ScanStore {
    public scanData = ref<CheckedScanData[]>([]);
    private isScanDataReceived = false;

    public overrideScanData = (data: CheckedScanData) => {
        this.scanData.val = [data];
        this.isScanDataReceived = true;
    }

   public pushScanData = (data: CheckedScanData) => {
       this.scanData.val.push(data);
       this.scanData.react();
       console.log(this.scanData.val);
   }

    public getScanData = () => {
        return this.scanData;
    }

    public getScanStatus = () => {
        return this.isScanDataReceived;
    }
}

const ScanStoreInstance = new ScanStore();
export default ScanStoreInstance;
