import { clsx, type ClassValue } from "clsx";
import { BinaryLike, createHash } from "crypto";
import JSZip from "jszip";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function formatFileSize(bytes: number, si: boolean = true, dp: number = 2) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + " B";
    }

    const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );

    return bytes.toFixed(dp) + " " + units[u];
}

function formatMilliseconds(milliseconds: number) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    const remainingHours = hours % 24;

    return `${days !== 0 ? `${days} days` : ""} ${
        remainingHours !== 0 ? `${remainingHours} hours` : ""
    }
    ${remainingMinutes !== 0 ? `${remainingMinutes} minutes` : ""} ${
        remainingSeconds !== 0 ? `${remainingSeconds} seconds` : ""
    }`;
}

async function createZip(files: File[]): Promise<Blob> {
    const zip = new JSZip();

    files.forEach((file) => {
        zip.file(file.name, file);
    });

    const content: Blob = await zip.generateAsync({ type: "blob" });
    return content;
}

function readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(reader.result);
            } else {
                reject(new Error("Result was not an ArrayBuffer"));
            }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(blob);
    });
}

async function hashBlob(blob: Blob): Promise<string | undefined> {
    const arrayBuffer = await readAsArrayBuffer(blob);
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    return bufferToHex(hashBuffer);
}

function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export { cn, formatFileSize, formatMilliseconds, createZip, hashBlob };
