import { Icons } from "@/components/icons";
import React from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import whizfileConfig from "@/lib/config/config";

const FileCard = React.forwardRef<
    HTMLDivElement,
    {
        className?: string;
        file: File;
        onRemove: Function;
    }
>(({ className, onRemove, file }, ref) => {
    const [isHovered, setIsHovered] = React.useState<boolean>(false);

    const truncateFileName = (fileName: string, maxLength: number = 15) => {
        const extension = fileName.slice(fileName.lastIndexOf("."));
        if (fileName.length > maxLength) {
            const namePartLength = maxLength - extension.length - 3; // 3 for '...'
            if (namePartLength > 0) {
                return `${fileName.substring(
                    0,
                    namePartLength
                )}...${extension}`;
            } else {
                return `...${extension.substring(-maxLength)}`;
            }
        }

        return fileName;
    };

    return (
        <div
            ref={ref}
            className={cn("relative flex flex-col rounded-xl p-1", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex flex-col items-center justify-start">
                <Icons.file fill="#4539cd" width={64} height={64} />
                <p className="text-sm text-primary font-semibold">
                    {truncateFileName(file.name)}
                </p>
                <p className="text-xs text-primary">
                    {formatFileSize(file.size)}
                </p>
                {isHovered && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(file);
                        }}
                        className="absolute top-1 right-1"
                        aria-label="Remove file"
                    >
                        <Icons.remove fill="#4539cd" width={24} height={24} />
                    </button>
                )}
            </div>
        </div>
    );
});
FileCard.displayName = "FileCard";

const DropZone = React.forwardRef<
    HTMLDivElement,
    {
        files: File[];
        setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    }
>(({ files, setFiles, ...props }, ref) => {
    {
        /* todo: auto size layout of files, drag and drop is very jittery */
    }

    const { maxSize } = whizfileConfig.api.transfer;

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
    const fileSizeUsedPercentage = (fileSize / maxSize) * 100;

    const handleRemoveFile = (file: File) => {
        setFiles(files.filter((f) => f !== file));
    };

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
            {files.length > 0 ? (
                <div
                    className="w-full h-full flex flex-col border-dashed border-primary border-8 rounded-2xl p-2"
                    {...getRootProps()}
                >
                    {/* Files */}
                    <div className="flex-grow overflow-auto custom-scrollbar">
                        <input {...getInputProps()} />
                        <div className="grid grid-flow-row grid-cols-4 gap-2 p-2">
                            {files.map((f) => (
                                <div
                                    key={f.name}
                                    className="flex-grow-0 flex-shrink-0"
                                >
                                    <FileCard
                                        file={f}
                                        onRemove={handleRemoveFile}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Progress bar and add button */}
                    <div className="flex flex-row w-full items-center justify-between h-16">
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
                            <Tooltip
                                tooltipText={`Transfers have a maximum size of ${formatFileSize(
                                    whizfileConfig.api.transfer.maxSize
                                )}. You have used ${formatFileSize(
                                    fileSize
                                )} of this maximum transfer size (${fileSizeUsedPercentage.toFixed(
                                    2
                                )}%).`}
                            >
                                <Icons.info
                                    fill="#4539cd"
                                    width={20}
                                    height={20}
                                />
                            </Tooltip>
                        </div>
                        {/* Add button */}
                        <div className="pr-3 cursor-pointer">
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
