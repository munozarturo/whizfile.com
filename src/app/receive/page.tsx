"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import * as React from "react";
import { useRouter } from "next/navigation";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/api/axios-instance";
import { useEffect, useState } from "react";
import { TransferLink } from "@/components/ui/transfer-link";
import { PulseLoader } from "react-spinners";

if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error(
        "`NEXT_PUBLIC_BASE_URL` environmnet variable must be defined."
    );
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Receive() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [transferId, setTransferId] = useState<string>("");

    const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    const fetchTransfer = async (transferId: string) => {
        const res = await axiosInstance.get(`/api/transfer/${transferId}`);
        return res.data;
    };

    const { data, error, refetch, isError, isLoading } = useQuery({
        queryKey: ["transfer", transferId],
        queryFn: async () => {
            return fetchTransfer(transferId);
        },
        enabled: false,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        await refetch();

        if (data) {
            router.push(`/receive/${transferId}`);
        }
    };

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
                    {isLoading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <PulseLoader
                                color="#4539cd"
                                size={20}
                                speedMultiplier={0.5}
                            />
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col w-full h-full gap-4"
                        >
                            {isError ? (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                                    <h2>
                                        uh oh! it looks like this transfer does
                                        not exist...
                                    </h2>
                                    <button
                                        onClick={() => {}}
                                        className="h-fit w-fit bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                                    >
                                        try again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={transferId}
                                        onChange={(e) =>
                                            setTransferId(e.target.value)
                                        }
                                        placeholder={`${BASE_URL}/receive/xxxxxx`}
                                        className="w-full p-2 border-2 border-primary rounded-md text-3xl font-bold first-line:italic text-gray-500"
                                    />
                                    <input
                                        type="submit"
                                        value="search"
                                        className="cursor-pointer h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-2xl"
                                    />
                                </>
                            )}
                        </form>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
