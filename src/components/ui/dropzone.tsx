import { cn } from "@/lib/utils";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Icons } from "@/components/icons";
import { formatFileSize } from "@/lib/utils";
import { ApiConfig } from "@/config/api";

const DropZone = React.forwardRef<
    HTMLDivElement,
    {
        className?: string;
        files: File[];
        setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    }
>(({ className, files, setFiles, ...props }, ref) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const updatedFiles = acceptedFiles.map((newFile) => {
                let newName = newFile.name;
                let count = 1;

                while (
                    files.some((existingFile) => existingFile.name === newName)
                ) {
                    const nameParts = newFile.name.split(".");
                    const extension = nameParts.pop();
                    newName = `${nameParts.join(".")} (${count}).${extension}`;
                    count++;
                }

                return new File([newFile], newName, {
                    type: newFile.type,
                    lastModified: newFile.lastModified,
                });
            });

            setFiles([...files, ...updatedFiles]);
        },
        [files, setFiles]
    );

    const removeFile = (fileNameToRemove: string) => {
        const updatedFiles = files.filter(
            (file) => file.name !== fileNameToRemove
        );
        setFiles(updatedFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    let fileSize = files.reduce((acc, file) => acc + file.size, 0);
    const fileSizeUsedPercentage =
        (fileSize / ApiConfig.fileUpload.maxUploadSize) * 100;

    return (
        <div
            className={cn(
                className,
                "text-primary italic font-bold flex flex-col gap-2"
            )}
        >
            <div
                {...getRootProps()}
                className="w-full flex flex-col items-center justify-center p-6 border-8 border-dashed border-primary rounded-2xl flex-grow"
            >
                <div className="flex flex-col w-full max-h-80 overflow-y-auto custom-scrollbar">
                    {files.map((file) => (
                        <li key={file.name}>
                            {file.name}, {formatFileSize(file.size)}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(file.name);
                                }}
                            >
                                <Icons.cross
                                    width={16}
                                    height={16}
                                    fill={"black"}
                                />
                            </button>
                        </li>
                    ))}
                </div>
                <Icons.add fill="#4539CD" width={96} height={96} />
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>drop the files here ...</p>
                ) : (
                    <p>drag and drop, or click to select files</p>
                )}
            </div>
            {files.length > 0 && (
                <div className="w-full bg-gray-300 rounded-full h-2.5">
                    <div
                        className={cn(
                            fileSizeUsedPercentage > 100
                                ? "bg-red-500"
                                : "bg-primary",
                            "h-2.5 rounded-full"
                        )}
                        style={{
                            width: `${Math.min(fileSizeUsedPercentage, 100)}%`,
                        }}
                    ></div>
                </div>
            )}
        </div>
    );
});

DropZone.displayName = "DropZone";

export default DropZone;
