import { Icons } from "@/components/icons";
import React from "react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";
import { useDropzone } from "react-dropzone";

const DropZone = React.forwardRef<
    HTMLDivElement,
    {
        className?: string;
        files: File[];
        setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    }
>(({ className, files, setFiles, ...props }, ref) => {
    /*
     * turn the whole screen purple when a file is being dragged and I want it to have a white plus icon in the middle that says "drop files"
     * I want it to have a plus button in the center when it is empty and to handle file uploads
     * I want it to have a progress bar at the bottom of how close the uploaded files are to the max upload limit
     * when a file is uploaded it has a little file card with the name of the file, the size, and an option to remove it
     *  I want this file card to have a different image for each file type. get some standard library or something.
     *  when a file has been uploaded the add button moves to the bottom right and the progress bar appears at the bottom between the left and the right.
     */

    return (
        <div className="w-full h-full flex flex-col gap-3 border-dashed border-primary border-8 rounded-2xl"></div>
    );
});

DropZone.displayName = "DropZone";

export default DropZone;
