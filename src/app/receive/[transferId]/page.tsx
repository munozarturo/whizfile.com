"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { PulseLoader } from "react-spinners";
import Transfer from "@/db/models/transfer";
import axiosInstance from "@/lib/api/axios-instance";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

function TransferView({ transfer }: { transfer: Transfer | undefined }) {
    const [downloadingFile, setDownloadingFile] = useState<boolean>(false);

    const downloadTransfer = async (transfer: Transfer | undefined) => {
        if (!transfer) throw new Error("Transfer is undefined.");

        try {
            setDownloadingFile(true);

            const transferId: string = transfer.transferId;
            const fileKey: string | null = transfer.fileKey;
            const response = await axiosInstance.get(`/api/file/${fileKey}`, {
                responseType: "blob",
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

            setDownloadingFile(false);
        } catch (error) {
            console.error("Error downloading the file", error);
        }
    };

    const formattedTime = new Date(transfer?.createdAt || 0);

    return (
        <div className="flex flex-col h-full w-full gap-2">
            {!downloadingFile && (
                <div className="w-full h-full flex flex-col">
                    <p className="text-primary text-xl font-semibold">
                        {transfer?.title}
                    </p>
                    <p className="text-primary text-xs">
                        {formattedTime.toDateString()}
                    </p>
                    <p className="h-full text-primary">{transfer?.message}</p>
                </div>
            )}
            {downloadingFile && (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                    <h2 className="text-lg font-semibold italic">
                        downloading transfer...
                    </h2>
                    <PulseLoader
                        color="#4539cd"
                        size={20}
                        speedMultiplier={0.5}
                    />
                </div>
            )}
            <button
                onClick={() => downloadTransfer(transfer)}
                className="h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
            >
                download
            </button>
        </div>
    );
}

export default function ReceiveTransferId(context: {
    params: { transferId: string };
}) {
    const transferId = context.params.transferId;

    const { data, error, refetch, isError, isLoading } = useQuery({
        queryKey: ["transferQuery", transferId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/api/transfer/${transferId}`);
            return res.data;
        },
    });

    let transfer: Transfer | undefined;

    if (data) {
        transfer = data.data as Transfer;
    }

    return (
        <main className="w-full h-full flex flex-row items-center justify-center">
            <Card className="w-3/5 h-3/4 flex flex-col">
                <CardHeader className="h-fit w-full">
                    <CardTitle
                        as="h1"
                        className="text-primary text-4xl text-center"
                    >
                        receive a transfer
                    </CardTitle>
                </CardHeader>
                {isLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <PulseLoader
                            color="#4539cd"
                            size={20}
                            speedMultiplier={0.5}
                        />
                    </div>
                ) : isError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                        <h2>
                            uh oh! an unexpected error occurred while fetching
                            your transfer...
                        </h2>
                        <button
                            onClick={() => refetch()}
                            className="h-fit w-fit bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                        >
                            try again
                        </button>
                    </div>
                ) : (
                    <CardContent className="h-full w-full flex flex-col">
                        <TransferView transfer={transfer} />
                    </CardContent>
                )}
            </Card>
        </main>
    );
}
