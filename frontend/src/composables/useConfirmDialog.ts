import { useConfirm } from 'primevue/useconfirm';

export interface ConfirmDialogOptions {
    message: string,
    header?: string,
    icon?: string,
    severity?: 'danger' | 'primary',
    acceptLabel?: string,
}

export function useConfirmDialog() {
    const confirm = useConfirm();

    async function confirmDialog(options: ConfirmDialogOptions) {

        return new Promise((resolve) => {
            confirm.require({
                header: options.header || 'Do you confirm?',
                message: options.message,
                icon: options.icon,
                accept: () => {
                    resolve(true);
                },
                reject: () => {
                    resolve(false);
                },
                acceptLabel: options.acceptLabel || 'Confirm',
                rejectLabel: 'Cancel',
                rejectProps: {
                    severity: 'secondary',
                },
                acceptProps: {
                    severity: options.severity || 'primary',
                },
                defaultFocus: 'reject',
                blockScroll: false,
            })
        });
    }

    return { confirmDialog };
}
