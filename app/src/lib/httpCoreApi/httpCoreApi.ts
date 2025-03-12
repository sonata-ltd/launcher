import { z } from "zod";
import { apiUrl } from "./constants"

type Store = {
    getVersionsManifest: () => Promise<JSON>
}

export const httpCoreApi = (): Store => {
    const hostUrl = "http://127.0.0.1:8080";

    const getVersionsManifest = (): Promise<JSON> => {
        return new Promise((res, rej) => {
            fetch(hostUrl + apiUrl.endpoints.getVersionsManifest, {
                method: 'GET'
            })
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
    } catch(e) {
        return false;
    }
}
