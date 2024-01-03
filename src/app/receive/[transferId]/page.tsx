"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatFileSize, formatMilliseconds } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";

import { AxiosProgressEvent } from "axios";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { PulseLoader } from "react-spinners";
import React from "react";
import { Tooltip } from "@/components/ui/tooltip";
import axiosInstance from "@/lib/api/axios-instance";

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

    const deleteTransfer = useMutation({
        mutationFn: async (transfer: { transferId: string }) => {
            setProgressState({
                status: "deleting transfer",
                progress: 0,
            });

            const resp = await axiosInstance.delete(
                `/api/transfers/${transfer.transferId}`
            );

            setProgressState({
                status: "deleting transfer",
                progress: 100,
            });
        },
    });

    if (isLoading || isDownloading || deleteTransfer.isPending) {
        return (
            <>
                <main className="w-full h-full flex flex-row justify-center items-center">
                    <Card className="flex flex-col items-center justify-center">
                        <CardHeader className="h-fit w-full">
                            <CardTitle
                                as="h1"
                                className="text-primary text-center"
                            >
                                {isLoading ? "fetching" : "downloading"}{" "}
                                transfer...
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="w-full sm:h-full flex flex-row items-center justify-center">
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
    } else if (deleteTransfer.isSuccess) {
        return (
            <>
                <main className="w-full h-full flex flex-row justify-center items-center">
                    <Card className="w-3/5 h-3/4 flex flex-col items-center justify-center">
                        <CardHeader className="h-fit w-full">
                            <CardTitle
                                as="h1"
                                className="text-primary text-center"
                            >
                                transfer deleted
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <h2>transfer deleted succesfully.</h2>
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
    } else if (isSuccess) {
        const transferId: string = data.data.transferId;
        const transfer: Transfer = data.data.transfer;
        const sentOn = new Date(transfer.timestamp);

        const tooltipText = {
            sentOn: `transfer sent on: ${new Date(
                transfer.timestamp
            ).toString()}`,
            views: `viewed ${transfer.views} out of ${transfer.maxViews} times. transfer will be deleted after ${transfer.maxViews} views.`,
            downloads: `downloaded ${transfer.downloads} out of ${transfer.maxDownloads} times. transfer will be deleted after ${transfer.maxDownloads} downloads.`,
            delete: "this transfer can be manually deleted. once deleted, it cannot be accessed again.",
            expiresIn: `expires on ${new Date(
                transfer.expireIn + transfer.timestamp
            )}. ${formatMilliseconds(expiresInLive)} from now.`,
            title: `title of the transfer.`,
            message: `message of the transfer.`,
            file: `the size of the files sent in this transfer.`,
        };

        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        const sentOnString = `${monthNames[
            sentOn.getMonth()
        ].toLowerCase()} ${sentOn.getDate()}`;

        return (
            <>
                <main className="w-full h-full flex flex-row justify-center items-center">
                    <Card className="flex flex-col items-center justify-center">
                        <CardTitle className="p-6 text-primary font-extrabold">
                            transfer
                        </CardTitle>
                        <CardContent className="w-full h-full flex flex-col gap-2">
                            <div className="flex flex-col">
                                <div className="flex sm:hidden w-full flex-row gap-3 justify-between items-center">
                                    <div className="flex flex-row">
                                        <Tooltip
                                            tooltipText={tooltipText.sentOn}
                                            className="flex flex-row gap-1"
                                        >
                                            <p className="text-sm font-bold text-primary italic">
                                                sent&nbsp;on&nbsp;
                                            </p>
                                            <p className="block w-full text-sm text-gray-700">
                                                {sentOnString}
                                            </p>
                                        </Tooltip>
                                    </div>
                                    <Tooltip tooltipText={tooltipText.views}>
                                        <div className="flex flex-row items-center">
                                            <Icons.view
                                                fill="#4539cd"
                                                width={24}
                                                height={24}
                                            />
                                            <p className="text-sm font-bold text-primary italic">
                                                {transfer.views}/
                                                {transfer.maxViews}
                                            </p>
                                        </div>
                                    </Tooltip>
                                    <Tooltip
                                        tooltipText={tooltipText.downloads}
                                    >
                                        <div className="flex flex-row items-center">
                                            <Icons.import
                                                fill="#4539cd"
                                                width={24}
                                                height={24}
                                            />
                                            <p className="text-sm font-bold text-primary italic">
                                                {transfer.downloads}/
                                                {transfer.maxDownloads}
                                            </p>
                                        </div>
                                    </Tooltip>
                                    {transfer.allowDelete && (
                                        <Tooltip
                                            tooltipText={tooltipText.delete}
                                        >
                                            <button
                                                onClick={async () =>
                                                    deleteTransfer.mutate({
                                                        transferId: transferId,
                                                    })
                                                }
                                                className="h-fit w-fit bg-red-500 rounded-xl p-1 text-secondary italic font-extrabold text-sm flex flex-row items-center"
                                            >
                                                <Icons.remove
                                                    width={24}
                                                    height={24}
                                                />
                                                delete
                                            </button>
                                        </Tooltip>
                                    )}
                                </div>
                                <div className="flex flex-row w-full items-center justify-between">
                                    <div className="flex flex-row gap-1">
                                        <p className="text-sm font-bold text-primary italic">
                                            title
                                        </p>
                                        <Tooltip
                                            tooltipText={tooltipText.title}
                                        >
                                            <Icons.info
                                                fill="#4539cd"
                                                width={20}
                                                height={20}
                                            />
                                        </Tooltip>
                                    </div>
                                    <div className="hidden sm:flex w-fit flex-row gap-3">
                                        <div className="flex flex-row">
                                            <Tooltip
                                                tooltipText={tooltipText.sentOn}
                                                className="flex flex-row gap-1"
                                            >
                                                <p className="text-sm font-bold text-primary italic">
                                                    sent&nbsp;on&nbsp;
                                                </p>
                                                <p className="block w-full text-sm text-gray-700">
                                                    {sentOnString}
                                                </p>
                                            </Tooltip>
                                        </div>
                                        <Tooltip
                                            tooltipText={tooltipText.views}
                                        >
                                            <div className="flex flex-row items-center">
                                                <Icons.view
                                                    fill="#4539cd"
                                                    width={24}
                                                    height={24}
                                                />
                                                <p className="text-sm font-bold text-primary italic">
                                                    {transfer.views}/
                                                    {transfer.maxViews}
                                                </p>
                                            </div>
                                        </Tooltip>
                                        <Tooltip
                                            tooltipText={tooltipText.downloads}
                                        >
                                            <div className="flex flex-row items-center">
                                                <Icons.import
                                                    fill="#4539cd"
                                                    width={24}
                                                    height={24}
                                                />
                                                <p className="text-sm font-bold text-primary italic">
                                                    {transfer.downloads}/
                                                    {transfer.maxDownloads}
                                                </p>
                                            </div>
                                        </Tooltip>
                                        {transfer.allowDelete && (
                                            <Tooltip
                                                tooltipText={tooltipText.delete}
                                            >
                                                <button
                                                    onClick={async () =>
                                                        deleteTransfer.mutate({
                                                            transferId:
                                                                transferId,
                                                        })
                                                    }
                                                    className="h-fit w-fit bg-red-500 rounded-xl p-1 text-secondary italic font-extrabold text-sm flex flex-row items-center"
                                                >
                                                    <Icons.remove
                                                        width={24}
                                                        height={24}
                                                    />
                                                    delete
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                                <p className="block w-full text-gray-700">
                                    {transfer.title}
                                </p>
                            </div>
                            <div className="flex flex-col h-fit sm:h-full">
                                <div className="flex flex-row gap-1">
                                    <p className="text-sm font-bold text-primary italic">
                                        message
                                    </p>
                                    <Tooltip tooltipText={tooltipText.message}>
                                        <Icons.info
                                            fill="#4539cd"
                                            width={20}
                                            height={20}
                                        />
                                    </Tooltip>
                                </div>
                                <p className="block w-full h-fit sm:h-full text-gray-700 overflow-y-auto word-wrap break-word">
                                    {transfer.message
                                        .split("\n")
                                        .map((line, index) => (
                                            <React.Fragment key={index}>
                                                {line}
                                                <br />
                                            </React.Fragment>
                                        ))}
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex flex-row gap-1">
                                    <p className="text-sm font-bold text-primary italic">
                                        expires in
                                    </p>
                                    <Tooltip
                                        tooltipText={tooltipText.expiresIn}
                                    >
                                        <Icons.info
                                            fill="#4539cd"
                                            width={20}
                                            height={20}
                                        />
                                    </Tooltip>
                                </div>
                                <p className="block w-full text-gray-700">
                                    {formatMilliseconds(expiresInLive)}
                                </p>
                            </div>
                            <div className="flex flex-col ">
                                <div className="flex flex-col">
                                    <div className="flex flex-row gap-1">
                                        <p className="text-sm font-bold text-primary italic">
                                            file
                                        </p>
                                        <Tooltip tooltipText={tooltipText.file}>
                                            <Icons.info
                                                fill="#4539cd"
                                                width={20}
                                                height={20}
                                            />
                                        </Tooltip>
                                    </div>
                                    <p className="block w-full text-gray-700">
                                        {formatFileSize(
                                            transfer.objectData.size
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={async () => await downloadTransfer()}
                                className="h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                            >
                                download
                            </button>
                        </CardContent>
                    </Card>
                </main>
            </>
        );
    } else if (isError) {
        return (
            <>
                <main className="w-full h-full flex flex-row justify-center items-center">
                    <Card className="flex flex-col items-center justify-center">
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
                    <Card className="flex flex-col items-center justify-center">
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
