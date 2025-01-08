export const pickImage = async () => {
    setUIBlocked(true);

    // Check tauri API availability
    if (tauriAvailable) {
        try {
            const { open } = window.__TAURI__.dialog;
            const input = await open({
                multiple: true,
                directory: false,
            });

            console.log(input);

            setUIBlocked(false);
        } catch (error) {
            console.error('Failed to open dialog using Tauri API:', error);

            setUIBlocked(false);
        }
    } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = "image/png, image/jpeg, image/gif, image/svg";

        input.onchange = () => {
            const rawInput = input.files;
            if (rawInput) {
                const files = Array.from(rawInput);
                console.log('File is chosen using default dialog:', files);

                setUIBlocked(false);
            }
        };

        input.click();
    }
};
