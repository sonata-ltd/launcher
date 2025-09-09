import { z } from "zod";
import { apiUrl } from "./constants"
import { ManifestDBID } from "lib/dbInterface/handler";

type Store = {
    getVersionsManifest: (type: ManifestDBID) => Promise<JSON>
}

export const httpCoreApi = (): Store => {
    const hostUrl = "http://127.0.0.1:8080";

    const getVersionsManifest = (type: ManifestDBID): Promise<JSON> => {
        let url;
        let fetch_options;
        if (type !== ManifestDBID.unifiedVersionManifest) {
            url = hostUrl + apiUrl.endpoints.getVersionsManifest;
            fetch_options = {
                method: 'POST',
                body: JSON.stringify({
                    manifest_type: type
                })
            }
        } else {
            url = hostUrl + apiUrl.endpoints.getVersionsUnified;
            fetch_options = {
                method: 'GET',
            }
        }

        return new Promise((res, rej) => {
            fetch(url, fetch_options)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP Error, status: ${res.status}`);
                    }

                    return res.json();
                })
                .then(json => {
                    res(json);
                })
                .catch(err => {
                    rej(err);
                })
        })
    }


    return {
        getVersionsManifest
    }
}


export const validateMessageType = <T extends z.ZodTypeAny>(schema: T, rawMsg: any): z.infer<T> | false => {
    try {
        return schema.parse(rawMsg) as z.infer<T>;
    } catch (e) {
        return false;
    }
}
