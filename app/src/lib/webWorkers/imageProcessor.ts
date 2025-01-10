import { expose } from "comlink";


export type ImageWorkerAPI = {
    processFile: (file: File) => Promise<{id: string, src: string}>,
    genFileBlob: (file: File) => Promise<Blob>,
    genFilePreview: (file: File, maxSize?: number) => Promise<Blob>
}

const processFile = async (file: File): Promise<{id: string, src: string}> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const id = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return new Promise((res) => {
        const reader = new FileReader();

        reader.onload = () => {
            res({ id, src: reader.result as string });
        }

        reader.readAsDataURL(file);
    });
}

const genFileBlob = async (file: File): Promise<Blob> => {
    return new Promise((res) => {
        res(file.slice());
    })
}

const genFilePreview = async (file: File, maxSize?: number): Promise<Blob> => {
    return new Promise((res, rej) => {
        const reader = new FileReader();

        console.log(file);

        reader.onload = async () => {
            const imgData = reader.result as string;

            if (!maxSize) {
                maxSize = 300;
            }

            const imgBlob = await fetch(imgData).then(res => res.blob());
            const imgBitmap = await createImageBitmap(imgBlob);

            const canvas = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                return rej(new Error("Failed to get canvas context"));
            }

            const scale = Math.min(maxSize / imgBitmap.width, maxSize / imgBitmap.height);
            canvas.width = imgBitmap.width * scale;
            canvas.height = imgBitmap.height * scale;

            ctx.drawImage(imgBitmap, 0, 0, canvas.width, canvas.height);

            canvas.convertToBlob({type: file.type})
                .then((blob) => res(blob))
                .catch((err) => rej(new Error(`Failed to create ${file.type} blob: `, err)))
        }

        reader.onerror = (e) => rej(e);
        reader.readAsDataURL(file);
    });
};

expose({ processFile, genFileBlob, genFilePreview } as ImageWorkerAPI)
