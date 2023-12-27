import { Icons } from "@/components/icons";
import React from "react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import whizfileConfig from "@/lib/config/config";

const FileCard = React.forwardRef<
    HTMLDivElement,
    {
        className?: string;
        file: File;
    }
>(({ className, file }, ref) => {
    return (
        <div ref={ref} className={cn("bg-red-500", className)}>
            {file.name} {file.type} {formatFileSize(file.size)}
        </div>
    );
});

const DropZone = React.forwardRef<
    HTMLDivElement,
    {
        files: File[];
        setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    }
>(({ files, setFiles, ...props }, ref) => {
    /*
     * when a file is uploaded it has a little file card with the name of the file, the size, and an option to remove it
     *  I want this file card to have a different image for each file type. get some standard library or something.
     */

    const onDrop = React.useCallback(
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

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    let fileSize = files.reduce((acc, file) => acc + file.size, 0);
    const fileSizeUsedPercentage =
        (fileSize / whizfileConfig.api.transfer.maxSize) * 100;

    return (
        <div className="w-full h-full">
            {isDragActive && (
                <div className="fixed inset-0 bg-primary flex flex-col gap-2 justify-center items-center z-50">
                    <Icons.add fill="white" width={96} height={96}></Icons.add>
                    <p className="text-white text-xl font-semibold select-none">
                        drop files here
                    </p>
                </div>
            )}
            {files.length >= 0 ? (
                <div className="w-full h-full flex flex-col border-dashed border-primary border-8 rounded-2xl">
                    {/* Files */}
                    <div className="w-full h-full bg-blue-200">
                        <input {...getInputProps()} />
                        <div className="flex flex-row gap-2 p-2">
                            {files.map((f) => (
                                <FileCard key={f.name} file={f} />
                            ))}
                        </div>
                    </div>
                    {/* Progress bar and add button */}
                    <div className="flex flex-row w-full h-16 items-center justify-start">
                        {/* Progress bar */}
                        <div className="w-full h-full flex flex-row items-center justify-center px-3">
                            <div className="w-full bg-gray-300 rounded-full h-5">
                                <div
                                    className={cn(
                                        fileSizeUsedPercentage > 100
                                            ? "bg-red-500"
                                            : "bg-primary",
                                        "h-5 rounded-full"
                                    )}
                                    style={{
                                        width: `${Math.min(
                                            fileSizeUsedPercentage,
                                            100
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                        {/* Add button */}
                        <div
                            className="pr-3 cursor-pointer"
                            {...getRootProps()}
                        >
                            <Icons.add
                                fill="#4539cd"
                                width={48}
                                height={48}
                            ></Icons.add>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className="w-full h-full flex flex-col gap-1 border-dashed border-primary border-8 rounded-2xl items-center justify-center"
                    {...getRootProps()}
                >
                    <Icons.add
                        fill="#4539cd"
                        width={96}
                        height={96}
                    ></Icons.add>
                    <input {...getInputProps()} />
                    <p className="font-semibold text-primary select-none">
                        click or drag and drop to add files
                    </p>
                </div>
            )}
        </div>
    );
});

DropZone.displayName = "DropZone";

export default DropZone;
