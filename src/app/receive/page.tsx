"use client";

import * as React from "react";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PulseLoader } from "react-spinners";
import axiosInstance from "@/lib/api/axios-instance";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error(
        "`NEXT_PUBLIC_BASE_URL` environmnet variable must be defined."
    );
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const BASE_URL_NO_HTTP = BASE_URL.startsWith("http://")
    ? BASE_URL.replace("http://", "")
    : BASE_URL.startsWith("https://")
    ? BASE_URL.replace("https://", "")
    : BASE_URL;

export default function Receive() {
    const router = useRouter();
    const [tryAgain, setTryAgain] = useState<boolean>(false);
    const [transferId, setTransferId] = useState<string>("");

    const { data, error, refetch, isError, isLoading } = useQuery({
        queryKey: ["transfer", transferId],
        queryFn: async () => {
            const { urlPrefix, urlTransferId } = parseTransferUrl(transferId);
            const res = await axiosInstance.get(`/api/transfer/${transferId}`);

            return res.data;
        },
        enabled: false,
        retry: false,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setTryAgain(false);

        const { data: newData } = await refetch();
        const { urlPrefix, urlTransferId } = parseTransferUrl(transferId);

        if (newData) {
            router.push(`/receive/${urlTransferId}`);
        }
    };

    const parseTransferUrl = (url: string) => {
        const transferIdRegex = /^[a-zA-Z0-9]{0,6}$/;
        const fullUrlPattern =
            /^(https?:\/\/)?whizfile\.com\/receive\/([a-zA-Z0-9]{0,6})$/;

        let urlPrefix = url;
        let urlTransferId = "";

        if (url.match(transferIdRegex)) {
            urlPrefix = "";
            urlTransferId = url;
        } else if (url.startsWith(`${BASE_URL}/receive/`)) {
            urlPrefix = `${BASE_URL}/receive/`;
            urlTransferId = url.replace(`${BASE_URL}/receive/`, "");
        } else if (url.startsWith(`${BASE_URL_NO_HTTP}/receive/`)) {
            urlPrefix = `${BASE_URL_NO_HTTP}/receive/`;
            urlTransferId = url.replace(`${BASE_URL_NO_HTTP}/receive/`, "");
        }

        return {
            urlPrefix: urlPrefix,
            urlTransferId: urlTransferId,
        };
    };

    const { urlPrefix, urlTransferId } = parseTransferUrl(transferId);

    const TransferQuerySchema = z.object({
        transferId: z.preprocess(
            (input) => {
                if (typeof input === "string") {
                    const { urlTransferId } = parseTransferUrl(input);
                    return urlTransferId;
                }
                return input;
            },
            z.string().refine((s) => /^[a-zA-Z0-9]{0,6}$/.test(s), {
                message: "transfer id must be 6 alphanumeric characters.",
            })
        ),
    });

    if (isLoading) {
        return (
            <main className="w-full h-full flex flex-row justify-center items-center">
                <Card className="w-3/5 h-fit flex flex-col">
                    <CardHeader className="h-fit w-full">
                        <CardTitle
                            as="h1"
                            className="text-primary text-4xl text-center"
                        >
                            find a transfer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col w-full h-full items-center justify-center ">
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <PulseLoader
                                color="#4539cd"
                                size={20}
                                speedMultiplier={0.5}
                            />
                        </div>
                    </CardContent>
                </Card>
            </main>
        );
    } else if (isError && !tryAgain) {
        return (
            <main className="w-full h-full flex flex-row justify-center items-center">
                <Card className="w-3/5 h-fit flex flex-col">
                    <CardHeader className="h-fit w-full">
                        <CardTitle
                            as="h1"
                            className="text-primary text-4xl text-center"
                        >
                            find a transfer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col w-full h-full items-center justify-center ">
                        <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                            <h2>
                                uh oh! it looks like a transfer with the id{" "}
                                <span className="text-xl text-primary font-bold">
                                    {urlTransferId}
                                </span>{" "}
                                does not exist...
                            </h2>
                            <button
                                onClick={() => {
                                    setTryAgain(true);
                                }}
                                className="h-fit w-fit bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                            >
                                try a new one
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        );
    } else {
        return (
            <main className="w-full h-full flex flex-row justify-center items-center">
                <Card className="w-3/5 h-fit flex flex-col">
                    <CardHeader className="h-fit w-full">
                        <CardTitle
                            as="h1"
                            className="text-primary text-4xl text-center"
                        >
                            find a transfer
                            <div className="flex flex-col items-start justify-start">
                                <p className="text-sm">tId: {urlTransferId}</p>
                                <p className="text-sm">uPf: {urlPrefix}</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col w-full h-full items-center justify-center ">
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col w-full h-full gap-4"
                        >
                            <div className="w-full h-fit flex flex-row p-2 border-2 border-primary rounded-md relative">
                                <div className="absolute flex flex-row pointer-events-none w-full h-fit">
                                    <span className="pointer-events-none w-fit text-3xl font-bold italic text-gray-500 focus:outline-none">
                                        {transferId === ""
                                            ? `${BASE_URL}/receive/`
                                            : urlPrefix}
                                    </span>
                                    <span className="pointer-events-none w-fit text-3xl font-bold italic text-primary focus:outline-none">
                                        {transferId === ""
                                            ? "xxxxxx"
                                            : urlTransferId}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={transferId}
                                    onChange={(e) =>
                                        setTransferId(e.target.value)
                                    }
                                    spellCheck="false"
                                    className="w-full text-3xl font-bold italic text-transparent focus:outline-none "
                                />
                            </div>

                            <input
                                type="submit"
                                value="search"
                                className="cursor-pointer h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-2xl"
                            />
                        </form>
                    </CardContent>
                </Card>
            </main>
        );
    }
}
