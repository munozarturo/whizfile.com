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
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/api/axios-instance";
import { useEffect, useState } from "react";

export default function Receive() {
    const router = useRouter();
    const [transferId, setTransferId] = useState<string>("");

    const fetchTransfer = async (transferId: string) => {
        const res = await axiosInstance.get(`/api/transfer/${transferId}`);
    };

    const { data, error, refetch, isError, isLoading } = useQuery({
        queryKey: ["transfer", transferId],
        queryFn: async () => fetchTransfer(transferId),
        enabled: false,
    });

    useEffect(() => {
        if (data) {
            // Redirect to the transfer page if data exists
            router.push(`/transfer/${transferId}`);
        }
    }, [data, router, transferId]);

    return (
        <main className="w-full h-full flex flex-row justify-center items-center">
            <Card className="w-3/5 h-3/4 flex flex-col">
                <CardHeader className="h-fit w-full">
                    <CardTitle
                        as="h1"
                        className="text-primary text-4xl text-center"
                    >
                        receive
                    </CardTitle>
                </CardHeader>
            </Card>
        </main>
    );
}
