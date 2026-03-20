import React from "react";
import { Dialog } from "@/components/ui/dialog";

interface MediaPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title?: string;
    type?: 'image' | 'video';
}

export const MediaPreviewModal = ({
    isOpen,
    onClose,
    url,
    title = "Media Preview",
    type = 'image'
}: MediaPreviewModalProps) => {
    if (!url) return null;

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title={title}
            width="900px"
        >
            <div className="relative w-full flex items-center justify-center bg-slate-900 rounded-lg overflow-hidden min-h-[400px]">
                {type === 'video' ? (
                    <div className="w-full aspect-video">
                        <video
                            src={url}
                            className="w-full h-full object-contain"
                            controls
                            autoPlay
                        />
                    </div>
                ) : (
                    <img
                        src={url}
                        alt={title}
                        className="max-h-[80vh] w-auto max-w-full object-contain shadow-2xl"
                    />
                )}
            </div>
        </Dialog>
    );
};
