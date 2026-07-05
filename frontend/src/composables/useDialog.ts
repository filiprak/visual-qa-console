import Button from 'primevue/button';
import { useDialog as _useDialog } from 'primevue/usedialog';
import { defineComponent, h, markRaw, ref, type DefineComponent } from 'vue';

export interface DialogOptions {
    header?: string;
    content?: any;
    severity?: 'danger' | 'primary';
}

export interface ConfirmDialogOptions<T = unknown> {
    header?: string;
    message?: any;
    data?: T;
    severity?: 'danger' | 'primary';
    acceptLabel?: string;
}

export function useDialog() {
    const dialog = _useDialog();

    async function openDialog(options: DialogOptions): Promise<any> {
        return new Promise((resolve) => {
            dialog.open(options.content, {
                props: {
                    header: options.header || 'Info',
                    modal: true,
                    blockScroll: true,
                },
                onClose: (closeOpts) => {
                    resolve(closeOpts?.data);
                },
            });
        });
    }

    async function confirmDialog<T = unknown>(options: ConfirmDialogOptions<T>): Promise<{ confirmed: boolean, data: T }> {
        return new Promise((resolve) => {
            let confirmed = false;

            const component = typeof options.message === 'string' ? h('span', options.message) : defineComponent({
                provide: { dialogData: options.data },
                setup() {
                    return () => h(options.message);
                },
            });

            const dialogRef = dialog.open(component, {
                props: {
                    header: options.header || 'Do you confirm?',
                    modal: true,
                    blockScroll: true,
                },
                templates: {
                    footer: markRaw(() => h('div', { class: 'flex gap-3' }, [
                        h(Button, {
                            severity: 'secondary',
                            onClick: () => {
                                dialogRef.close(dialogRef.data);
                            }
                        }, 'Cancel'),
                        h(Button, {
                            severity: options.severity || 'primary',
                            onClick: () => {
                                confirmed = true;
                                dialogRef.close(dialogRef.data);
                            },
                        }, options.acceptLabel || 'Confirm'),
                    ])),
                },
                onClose: (closeOpts) => {
                    resolve({
                        confirmed,
                        data: closeOpts?.data,
                    });
                },
            });
        });
    }

    return { openDialog, confirmDialog };
}
