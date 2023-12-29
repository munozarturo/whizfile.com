"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatFileSize, formatMilliseconds } from "@/lib/utils";

import { AxiosProgressEvent } from "axios";
import Link from "next/link";
import { PulseLoader } from "react-spinners";
import React from "react";
import axiosInstance from "@/lib/api/axios-instance";
import { useQuery } from "@tanstack/react-query";

type Transfer = {
    title: string;
    message: string;
    timestamp: number;
    expireIn: number;
    expiresIn: number;
    views: number;
    downloads: number;
    maxViews: number;
    status: string;
    maxDownloads: number;
    objectData: {
        size: number;
        fileHash: string;
    };

    allowDelete: boolean;
};

export default function ReceiveTransferId(context: {
    params: { transferId: string };
}) {
    const [progressState, setProgressState] = React.useState<{
        status: string;
        progress: number;
    }>({ status: "no status", progress: 0 });
    const [isDownloading, setIsDownloading] = React.useState<boolean>(false);
    const [donwloadError, setDownloadError] = React.useState<boolean>(false);
    const [expiresInLive, setExpiresInLive] = React.useState<number>(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setExpiresInLive((prev) => prev - 1000);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const transferId = context.params.transferId;

    const { data, error, refetch, isError, isLoading, isSuccess } = useQuery({
        queryKey: ["transferQuery", transferId],
        queryFn: async () => {
            setProgressState({ status: "fetching transfer", progress: 0 });

            const res = await axiosInstance.get(`/api/transfers/${transferId}`);

            setProgressState({ status: "fetching transfer", progress: 100 });

            return res.data;
        },
        retry: false,
    });

    React.useEffect(() => {
        if (isSuccess && data?.data?.transfer) {
            setExpiresInLive(data.data.transfer.expiresIn);
        }
    }, [isSuccess, data]);

    const downloadTransfer = async () => {
        try {
            setIsDownloading(true);

            setProgressState({
                status: "fecthing object data",
                progress: 0,
            });

            const objectResponse = await axiosInstance.get(
                `/api/objects/${transferId}`
            );

            setProgressState({
                status: "fecthing object data",
                progress: 100,
            });

            setProgressState({
                status: "downloading transfer",
                progress: 0,
            });

            const response = await axiosInstance.get(
                objectResponse.data.data.download.url,
                {
                    responseType: "blob",
                    onDownloadProgress: (e: AxiosProgressEvent) => {
                        const percentCompleted = Math.round(
                            (e.loaded * 100) / (e.total || 100)
                        );

                        setProgressState({
                            status: "downloading transfer",
                            progress: percentCompleted,
                        });
                    },
                }
            );

            setProgressState({
                status: "opening download",
                progress: 0,
            });

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `whizfile-transfer-${transferId}.zip`
            );
            document.body.appendChild(link);
            link.click();

            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }

            setProgressState({
                status: "opening download",
                progress: 100,
            });

            setIsDownloading(false);
        } catch (error) {
            setDownloadError(true);
        }
    };

    if (isLoading || isDownloading) {
        return (
            <>
                <main className="w-full h-full flex flex-row justify-center items-center">
                    <Card className="w-3/5 h-3/4 flex flex-col items-center justify-center">
                        <CardHeader className="h-fit w-full">
                            <CardTitle
                                as="h1"
                                className="text-primary text-center"
                            >
                                {isLoading ? "fetching" : "downloading"}{" "}
                                transfer...
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="w-full h-full flex flex-row items-center justify-center">
                            <div className="w-full h-full flex flex-col items-center justify-center gap-5">
                                <PulseLoader
                                    color="#4539cd"
                                    size={20}
                                    speedMultiplier={0.5}
                                />
                                <div className="flex flex-col items-center justify-center">
                                    <p className="">
                                        {progressState.status}...
                                    </p>
                                    <p className="text-sm italic">
                                        {progressState.progress}% done
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </>
        );
    } else if (isSuccess) {
        const transferId: string = data.data.transferId;
        const transfer: Transfer = data.data.transfer;

        return (
            <>
                <main className="w-full h-full flex flex-row justify-center items-center">
                    <Card className="w-3/5 h-3/4 flex flex-col items-center justify-center">
                        <CardTitle className="p-6 text-primary font-extrabold">
                            transfer
                        </CardTitle>
                        <CardContent className="w-full h-full flex flex-col">
                            <p className="text-sm font-bold text-primary italic">
                                status
                            </p>
                            <p className="block w-full text-gray-700">
                                {transfer.status}
                            </p>
                            <p className="text-sm font-bold text-primary italic">
                                sent on
                            </p>
                            <p className="block w-full text-gray-700">
                                {new Date(transfer.timestamp)
                                    .toString()
                                    .toLowerCase()}
                            </p>
                            <p className="text-sm font-bold text-primary italic">
                                expires in
                            </p>
                            <p className="block w-full text-gray-700">
                                {formatMilliseconds(expiresInLive)}
                            </p>
                            <p className="text-sm font-bold text-primary italic">
                                title
                            </p>
                            <p className="block w-full text-gray-700">
                                {transfer.title}
                            </p>
                            <p className="text-sm font-bold text-primary italic">
                                message
                            </p>
                            <p className="block w-full text-gray-700 overflow-y-auto word-wrap break-word">
                                {transfer.message}
                            </p>
                            <div className="flex flex-row items-center justify-start gap-2">
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-primary italic">
                                        views
                                    </p>
                                    <p className="block w-full text-gray-700">
                                        {transfer.views}
                                    </p>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-primary italic">
                                        max views
                                    </p>
                                    <p className="block w-full text-gray-700">
                                        {transfer.maxViews}
                                    </p>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-primary italic">
                                        downloads
                                    </p>
                                    <p className="block w-full text-gray-700">
                                        {transfer.downloads}
                                    </p>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-primary italic">
                                        max downloads
                                    </p>
                                    <p className="block w-full text-gray-700">
                                        {transfer.maxDownloads}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-bold text-primary italic">
                                    size
                                </p>
                                <p className="block w-full text-gray-700">
                                    {formatFileSize(transfer.objectData.size)}
                                </p>
                            </div>
                            <button
                                onClick={async () => await downloadTransfer()}
                                className="h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                            >
                                download
                            </button>
                            {transfer.allowDelete && (
                                <button
                                    onClick={async () =>
                                        await downloadTransfer()
                                    }
                                    className="h-fit w-full bg-red-500 rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                                >
                                    delete
                                </button>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </>
        );
    } else if (isError) {
        return (
            <>
                <main className="w-full h-full flex flex-row justify-center items-center">
                    <Card className="w-3/5 h-3/4 flex flex-col items-center justify-center">
                        <CardHeader className="h-fit w-full">
                            <CardTitle
                                as="h1"
                                className="text-primary text-center"
                            >
                                404, not found
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h2>
                                huh! it looks like this transfer does not exist.
                            </h2>
                        </CardContent>
                        <CardFooter>
                            <Link
                                href="/."
                                className="group transition duration-300 text-center text-white text-lg font-bold italic bg-primary p-2 rounded-xl"
                            >
                                take me home
                            </Link>
                        </CardFooter>
                    </Card>
                </main>
            </>
        );
    } else if (donwloadError) {
        return (
            <>
                <main className="w-full h-full flex flex-row justify-center items-center">
                    <Card className="w-3/5 h-3/4 flex flex-col items-center justify-center">
                        <CardHeader className="h-fit w-full">
                            <CardTitle
                                as="h1"
                                className="text-primary text-center"
                            >
                                download error
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h2>
                                there was an error downloading this transfer
                            </h2>
                        </CardContent>
                    </Card>
                </main>
            </>
        );
    }
}
