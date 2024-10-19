import { ref } from "hywer/jsx-runtime";

class ImageStore {
    private static storeKey = "storedImages"
    public lastImage = ref("");
    public loadedImages = ref<string[]>([]);
    public savedAlertHighlight = ref<number[]>([]);

    constructor() {
        this.loadedImages.val = this.loadImages();
    }

    public addImage(path: string) {
        if (this.loadedImages.val.includes(path)) {
            const imageIndex = this.loadedImages.val.indexOf(path);

            this.savedAlertHighlight.val.push(imageIndex);
            this.savedAlertHighlight.react();

            return imageIndex;
        } else {
            this.loadedImages.val.push(path);
            this.loadedImages.react();
            this.rememberImages();
            return null;
        }
    }

    private rememberImages() {
        localStorage.setItem(ImageStore.storeKey, JSON.stringify(this.loadedImages.val));
    }

    public loadImages() {
        const storedData = localStorage.getItem(ImageStore.storeKey);

        if (storedData) {
            return JSON.parse(storedData);
        } else {
            return [];
        }
    }
}

const ImageStoreInstance = new ImageStore;
export default ImageStoreInstance;
