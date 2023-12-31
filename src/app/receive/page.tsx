"use client";

import * as React from "react";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { PulseLoader } from "react-spinners";
import axiosInstance from "@/lib/api/axios-instance";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

function parseTransferUrl(url: string): {
    urlPrefix: string;
    urlTransferId: string;
} {
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
}

export default function Receive() {
    const router = useRouter();
    const [tryAgain, setTryAgain] = useState<boolean>(false);

    const TransferQuerySchema = z.object({
        transferId: z.preprocess(
            (input) => {
                if (typeof input === "string") {
                    const { urlTransferId } = parseTransferUrl(input);
                    return urlTransferId;
                }
                return input;
            },
            z.string().refine((s) => /^[a-zA-Z0-9]{6}$/.test(s), {
                message: "transfer id must contain 6 alphanumeric characters.",
            })
        ),
    });

    type ValidationSchemaType = z.infer<typeof TransferQuerySchema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<ValidationSchemaType>({
        resolver: zodResolver(TransferQuerySchema),
        defaultValues: {
            transferId: "",
        },
    });

    const onSubmit = async (data: ValidationSchemaType) => {
        setTryAgain(false);
        const { data: newData } = await refetch();
        const { urlPrefix, urlTransferId } = parseTransferUrl(data.transferId);
        if (newData) {
            router.push(`/receive/${urlTransferId}`);
        }
    };

    const transferId = watch("transferId");

    const { data, error, refetch, isError, isLoading, isSuccess } = useQuery({
        queryKey: ["transfer", transferId],
        queryFn: async () => {
            const { urlPrefix, urlTransferId } = parseTransferUrl(transferId);
            const res = await axiosInstance.get(
                `/api/transfers/${urlTransferId}`
            );

            return res.data;
        },
        enabled: false,
        retry: false,
    });

    const { urlPrefix, urlTransferId } = parseTransferUrl(transferId);

    if (isLoading || isSuccess) {
        return (
            <main className="w-full h-full flex flex-row justify-center items-center">
                <Card
                    className="flex flex-col items-center justify-center"
                    height="fit"
                >
                    <CardHeader className="h-fit w-full">
                        <CardTitle
                            as="h1"
                            className="text-primary text-4xl text-center"
                        >
                            find a transfer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col w-full items-center justify-center ">
                        <div className="w-full flex flex-col items-center justify-center">
                            <PulseLoader
                                color="#4539cd"
                                size={20}
                                speedMultiplier={0.5}
                            />
                        </div>
                        {isSuccess && (
                            <p>redirecting you to your transfer...</p>
                        )}
                    </CardContent>
                </Card>
            </main>
        );
    } else if (isError && !tryAgain) {
        return (
            <main className="w-full h-full flex flex-row justify-center items-center">
                <Card
                    className="flex flex-col items-center justify-center"
                    height="fit"
                >
                    <CardHeader className="h-fit">
                        <CardTitle
                            as="h1"
                            className="text-primary text-4xl text-center"
                        >
                            find a transfer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col w-full items-center justify-center ">
                        <div className="w-full flex flex-col items-center justify-center space-y-2 text-center">
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
                <Card className="h-fit flex flex-col" height="fit">
                    <CardHeader className="w-full">
                        <CardTitle
                            as="h1"
                            className="text-primary text-4xl text-center"
                        >
                            find a transfer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col w-full h-fit items-center justify-center ">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col w-full h-fit gap-2"
                        >
                            <div className="w-full h-fit flex flex-row p-2 border-2 border-primary rounded-md relative">
                                <div className="absolute flex flex-row pointer-events-none w-full h-fit">
                                    <span className="pointer-events-none w-fit text-lg sm:text-3xl font-bold italic text-gray-500 focus:outline-none">
                                        {transferId === ""
                                            ? `${BASE_URL}/receive/`
                                            : urlPrefix}
                                    </span>
                                    <span className="pointer-eventslg-none w-fit text-lg sm:text-3xl font-bold italic text-primary focus:outline-none">
                                        {transferId === ""
                                            ? "xxxxxx"
                                            : urlTransferId}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    spellCheck="false"
                                    {...register("transferId")}
                                    className="w-full text-lg sm:text-3xl font-bold italic text-transparent focus:outline-none "
                                />
                            </div>
                            {errors.transferId && (
                                <span className="text-sm sm:text-md font-semibold italic text-red-500">
                                    {errors.transferId.message}
                                </span>
                            )}
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
