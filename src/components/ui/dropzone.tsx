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
    // const fileSizeUsedPercentage =
    //     (fileSize / ApiConfig.fileUpload.maxUploadSize) * 100;
    const fileSizeUsedPercentage = (fileSize / 100) * 100;

    return (
        <div
            className={cn(
                className,
                "text-primary italic font-bold flex flex-col gap-2"
            )}
        >
            {files.length > 0 && (
                <div>
                    <h2
                        className={`text-xl ${
                            fileSize > ApiConfig.fileUpload.maxUploadSize
                                ? "text-red-500"
                                : "text-primary"
                        }`}
                    >
                        files [{formatFileSize(fileSize, true)} /{" "}
                        {formatFileSize(
                            ApiConfig.fileUpload.maxUploadSize,
                            true
                        )}
                        ]
                    </h2>
                    <div className="border-primary border-t-2 my-1"></div>
                    <div className="relative custom-scrollbar overflow-y-auto max-h-[200px] w-full">
                        <ul>
                            {files.map((file) => (
                                <li
                                    key={file.name}
                                    className="group flex flex-row gap-1 items-center transition duration-300"
                                >
                                    <p>
                                        {file.name.length > 30
                                            ? file.name.substring(0, 30) + "..."
                                            : file.name}{" "}
                                        [{formatFileSize(file.size, true, 1)}]
                                    </p>
                                    <button
                                        className="opacity-0 group-hover:opacity-100 transition duration-300 rounded-full"
                                        onClick={() => removeFile(file.name)}
                                    >
                                        <Icons.cross
                                            fill="#000000"
                                            width={16}
                                            height={16}
                                        />
                                    </button>
                                </li>
                            ))}
                            maxUploadSize
                        </ul>
                    </div>
                </div>
            )}
            <div
                {...getRootProps()}
                className="w-full flex flex-col items-center justify-center p-6 border-8 border-dashed border-primary rounded-2xl flex-grow"
            >
                <Icons.add fill="#4539CD" width={96} height={96} />
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>drop the files here ...</p>
                ) : (
                    <p>drag and drop, or click to select files</p>
                )}
            </div>
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
        </div>
    );
});

DropZone.displayName = "DropZone";

export default DropZone;
