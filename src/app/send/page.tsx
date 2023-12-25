"use client";

import * as React from "react";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import DropZone from "@/components/ui/dropzone";
import JSZip from "jszip";
import { PulseLoader } from "react-spinners";
import { TransferLink } from "@/components/ui/transfer-link";
import axiosInstance from "@/lib/api/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error("`NEXT_PUBLIC_BASE_URL` not defined.");
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function createZip(files: File[]): Promise<Blob> {
    const zip = new JSZip();

    files.forEach((file) => {
        zip.file(file.name, file);
    });

    const content: Blob = await zip.generateAsync({ type: "blob" });
    return content;
}

export default function Send() {
    const [files, setFiles] = useState<File[]>([]);
    const [title, setTitle] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const submitTransfer = async ({
        title,
        message,
        file,
    }: {
        title: string;
        message: string;
        file: Blob;
    }) => {
        const transferResp = await axiosInstance.post("/api/transfer", {
            title: title,
            message: message,
        });

        const data = transferResp.data.data as unknown as {
            oneTimeCode: string;
            transferId: string;
        };

        const formData = new FormData();
        formData.set("file", file);
        formData.set("oneTimeCode", data.oneTimeCode);
        formData.set("transferId", data.transferId);

        await axiosInstance.post("/api/file", formData);

        return data.transferId;
    };

    const mutation = useMutation({
        mutationFn: async (transferUpload: {
            title: string;
            message: string;
            file: Blob;
        }) => {
            const file: Blob = await createZip(files);
            const fileNames: string[] = files.map((f) => f.name);
            return submitTransfer(transferUpload);
        },
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const zipFile = await createZip(files);
        mutation.mutate({
            title,
            message,
            file: zipFile,
        });
    };

    return (
        <main className="w-full h-full flex flex-row justify-center items-center">
            <Card className="w-3/5 h-3/4 flex flex-row">
                {mutation.isPending ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <PulseLoader
                            color="#4539cd"
                            size={20}
                            speedMultiplier={0.5}
                        />
                    </div>
                ) : mutation.isError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                        <h2>
                            uh oh! an unexpected error occurred while fetching
                            your transfer...
                        </h2>
                        <button
                            onClick={async () =>
                                mutation.mutate({
                                    title,
                                    message,
                                    file: await createZip(files),
                                })
                            }
                            className="h-fit w-fit bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                        >
                            try again
                        </button>
                    </div>
                ) : mutation.isSuccess ? (
                    <div className="h-full w-full flex flex-col">
                        <CardContent className="h-full w-full flex flex-col space-y-5 items-center justify-center">
                            <CardTitle
                                as="h1"
                                className="text-primary text-center"
                            >
                                transfer sent
                            </CardTitle>
                            <TransferLink
                                className="text-lg text-gray-500 font-semibold italic outline rounded-lg p-1"
                                tooltipText="click to copy"
                                copyText={`${BASE_URL}/receive/${mutation.data}`}
                                displayText={`${BASE_URL}/receive/${mutation.data}`}
                            ></TransferLink>
                            <button
                                onClick={async () => {
                                    setFiles([]);
                                    setTitle("");
                                    setMessage("");
                                    mutation.reset();
                                }}
                                className="h-fit w-fit bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                            >
                                send another
                            </button>
                        </CardContent>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="w-full h-full flex flex-row"
                    >
                        <div className="w-1/2 h-full flex flex-col">
                            <CardHeader className="h-fit w-full">
                                <CardTitle
                                    as="h1"
                                    className="text-primary text-center"
                                >
                                    send
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-full w-full flex flex-col space-y-2">
                                <div className="flex flex-col">
                                    <input
                                        className="text-primary text-xl font-semibold outline-none"
                                        type="text"
                                        name="title"
                                        placeholder="your title"
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                    />
                                </div>
                                <textarea
                                    className="h-full text-primary outline-none"
                                    name="message"
                                    placeholder="your message"
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                                <input
                                    type="submit"
                                    value="get a link"
                                    className="cursor-pointer h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                                />
                            </CardContent>
                        </div>
                        <div className="w-1/2 h-full flex flex-row items-center justify-center py-6 pr-6">
                            <DropZone
                                className="w-full h-full"
                                files={files}
                                setFiles={setFiles}
                            />
                        </div>
                    </form>
                )}
            </Card>
        </main>
    );
}
