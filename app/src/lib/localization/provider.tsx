import i18next from "i18next";
import { createContext, createSignal, ParentProps, useContext } from "solid-js";

const LocalizationContext = createContext();

export const LocalizationProvider = (props: ParentProps) => {
    const lang = i18next.init({
        lng: 'en',
        debug: true,
        resources: {
            en: {
                translation: {
                    "static": {
                        "fetch_manifest": "Fetch Manifest",
                        "download_libs": "Download Libraries",
                        "download_assets": "Download Assets",
                    },
                    "in_progress": {
                        "fetch_manifest": "Fetching Manifest",
                        "download_libs": "Downloading Libraries",
                        "download_assets": "Downloading Assets",
                    }
                }
            }
        }
    })

    const store = [
        {
            lang() {
                return i18next.init({
                        lng: 'en',
                        debug: true,
                        resources: {
                            en: {
                                translation: {
                                    "static": {
                                        "fetch_manifest": "Fetch Manifest",
                                        "download_libs": "Download Libraries",
                                        "download_assets": "Download Assets",
                                    },
                                    "in_progress": {
                                        "fetch_manifest": "Fetching Manifest",
                                        "download_libs": "Downloading Libraries",
                                        "download_assets": "Downloading Assets",
                                    }
                                }
                            }
                        }
                    })
            }
        }
    ];

    return (
        <LocalizationContext.Provider value={store}>
            {props.children}
        </LocalizationContext.Provider>
    )
}

export const useLocalization = () => {
    const context = useContext(LocalizationContext);

    if (!context) {
        throw new Error("useLocalization must be used inside LocalizationProvider");
    }

    return context;
}
