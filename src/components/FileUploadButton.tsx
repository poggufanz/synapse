"use client";

import { useState, useRef, useCallback } from "react";
import { Paperclip, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface FileAttachment {
    data: string;      // Base64 encoded
    mimeType: string;
    name: string;
    size: number;
    preview?: string;  // For image thumbnails
}

interface FileUploadButtonProps {
    onFilesChange: (files: FileAttachment[]) => void;
    files: FileAttachment[];
    maxFiles?: number;
    maxSizeMB?: number;
    accept?: string;
    disabled?: boolean;
    variant?: "button" | "inline" | "dropzone";
}

const ACCEPTED_TYPES = {
    "image/png": true,
    "image/jpeg": true,
    "image/webp": true,
    "image/heic": true,
    "image/heif": true,
    "application/pdf": true,
};

export default function FileUploadButton({
    onFilesChange,
    files,
    maxFiles = 5,
    maxSizeMB = 10,
    accept = "image/*,application/pdf",
    disabled = false,
    variant = "button",
}: FileUploadButtonProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback(async (file: File): Promise<FileAttachment | null> => {
        // Validate file type
        if (!ACCEPTED_TYPES[file.type as keyof typeof ACCEPTED_TYPES]) {
            console.warn(`Unsupported file type: ${file.type}`);
            return null;
        }

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`File "${file.name}" exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`);
            return null;
        }

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                // Extract base64 data (remove data:mime;base64, prefix)
                const base64Data = result.split(",")[1];

                const attachment: FileAttachment = {
                    data: base64Data,
                    mimeType: file.type,
                    name: file.name,
                    size: file.size,
                };

                // Generate preview for images
                if (file.type.startsWith("image/")) {
                    attachment.preview = result;
                }

                resolve(attachment);
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    }, [maxSizeMB]);

    const handleFiles = useCallback(async (fileList: FileList | null) => {
        if (!fileList || disabled) return;

        setIsProcessing(true);
        const newFiles: FileAttachment[] = [];

        for (let i = 0; i < fileList.length && files.length + newFiles.length < maxFiles; i++) {
            const processed = await processFile(fileList[i]);
            if (processed) {
                newFiles.push(processed);
            }
        }

        if (newFiles.length > 0) {
            onFilesChange([...files, ...newFiles]);
        }
        setIsProcessing(false);
    }, [files, maxFiles, disabled, processFile, onFilesChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const removeFile = useCallback((index: number) => {
        onFilesChange(files.filter((_, i) => i !== index));
    }, [files, onFilesChange]);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // File preview component
    const FilePreview = ({ file, index }: { file: FileAttachment; index: number }) => (
        <div className="relative group animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="relative bg-white rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all">
                {file.preview ? (
                    // Image preview
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                        <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    // PDF/Document preview
                    <div className="w-20 h-20 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 rounded-lg">
                        <FileText size={24} className="text-red-500 mb-1" />
                        <span className="text-[10px] font-bold text-red-600 uppercase">PDF</span>
                    </div>
                )}

                {/* File info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 rounded-b-lg">
                    <p className="text-[9px] text-white truncate font-medium">{file.name}</p>
                    <p className="text-[8px] text-white/70">{formatSize(file.size)}</p>
                </div>

                {/* Remove button - Always visible, inside card */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
                >
                    <X size={10} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-3">
            {/* File previews */}
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {files.map((file, index) => (
                        <FilePreview key={`${file.name}-${index}`} file={file} index={index} />
                    ))}
                </div>
            )}

            {/* Upload button/dropzone */}
            {variant === "dropzone" ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
                        ${isDragging
                            ? "border-blue-400 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        }
                        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                >
                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-blue-500" size={24} />
                            <span className="text-sm text-slate-500">Processing...</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center gap-2 mb-2">
                                <ImageIcon size={20} className="text-blue-400" />
                                <FileText size={20} className="text-red-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-600">
                                Drag & drop files here, or <span className="text-blue-500">browse</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Images (PNG, JPEG, WEBP) or PDF • Max {maxSizeMB}MB
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isProcessing || files.length >= maxFiles}
                    className={`
                        inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
                        ${files.length > 0
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    {isProcessing ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Paperclip size={16} />
                    )}
                    {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'Attach'}
                </button>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
            />
        </div>
    );
}
