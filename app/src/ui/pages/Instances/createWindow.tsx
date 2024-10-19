import { Version, VersionsManifest } from "@/data/types";
import { ref } from "hywer/jsx-runtime";
import Api from '@/data/api';
import Store from '@/data/store';

export enum contentStackStates {
    InstanceDetails,
    ProgressDisplay
}

class CreateWindow {
    public contentStackIndex = ref<number>(0);
    public tabSelection = ref(0);
    public selectedVersion = ref<Version>({
        complianceLevel: 0,
        id: '',
        releaseTime: '',
        sha1: '',
        time: '',
        type: '',
        url: ''
    });

    public versionsManifest = ref<VersionsManifest>({
        latest: {
            release: '',
            snapshot: ''
        },
        versions: []
    });

    public selectedVersionUrl = ref<string>("");
    public selectedVersionId = ref<string>("");
    public selectedInstanceName = "";

    public contentStackValues = [
        contentStackStates.InstanceDetails,
        contentStackStates.ProgressDisplay
    ]


    constructor() {
        this.versionsManifest.val = Store.getGlobalManifestData() as unknown as VersionsManifest;
        console.log("Constructed");
    }

    public previousWindow = () => {
        this.contentStackIndex.val--;
    }

    public nextWindow = () => {
        this.contentStackIndex.val++;
    }

    public getVersionsManifest = async () => {
        Api.getVersionsManifest()
            .then(json => {
                Store.setGlobalManifestData(json);
                this.versionsManifest.val = json as unknown as VersionsManifest;
            })
            .catch(err => { console.log(err) })

        console.log(this.versionsManifest.val);
    }


    public handleVersionChange = async (id: string, url: string) => {
        this.selectedVersionId.val = id;
        this.selectedVersionUrl.val = url;
        console.log(this.selectedVersionId.val);
    }


    public requestVersionDownload = async (ws: WebSocket) => {
        const info = new Map<string, string>();
        info.set("${auth_player_name}", "Melicta");
        info.set("${version_name}", this.selectedVersion.val.id);
        info.set("${version_type}", this.selectedVersion.val.type);
        info.set("${user_type}", "legacy");
        info.set("${auth_uuid}", "99b3e9029022309dae725bb19e275ecb");
        info.set("${auth_access_token}", "[asdasd]");

        let infoObject: Record<string, string> = {};
        info.forEach((value, key) => {
            infoObject[key] = value;
        });

        let body = JSON.stringify({
            name: this.selectedInstanceName,
            url: this.selectedVersionUrl.val,
            info: infoObject
        })

        ws.send(body);
    }
}

const CreateWindowInstance = new CreateWindow;
export default CreateWindowInstance;
