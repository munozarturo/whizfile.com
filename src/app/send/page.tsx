"use client";

import * as React from "react";
import * as zod from "zod";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SubmitHandler, useForm } from "react-hook-form";
import { formatMilliseconds, hashBlob } from "@/lib/utils";

import { AxiosProgressEvent } from "axios";
import DropZone from "@/components/dropzone";
import { Icons } from "@/components/icons";
import JSZip from "jszip";
import { PulseLoader } from "react-spinners";
import { Tooltip } from "@/components/ui/tooltip";
import { TransferFormSchema } from "@/lib/validations/transfer";
import { TransferLink } from "@/components/transfer-link";
import { TransfersReq } from "@/lib/api/validations/transfers";
import axiosInstance from "@/lib/api/axios-instance";
import { useMutation } from "@tanstack/react-query";
import whizfileConfig from "@/lib/config/config";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error("`NEXT_PUBLIC_BASE_URL` not defined.");
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Send() {
    const {
        maxTitleLength,
        maxMessageLength,
        maxDownloadsMin,
        maxDownloadsMax,
        maxViewsMin,
        maxViewsMax,
        expireInMax,
    } = whizfileConfig.api.transfer;

    const maxExpireInAsStr: string = formatMilliseconds(expireInMax);
    const maxExpireIn = new Date(Date.now() + expireInMax);

    // Formatting the date to YYYY-MM-DD
    const maxExpireInDate = [
        maxExpireIn.getFullYear(),
        String(maxExpireIn.getMonth() + 1).padStart(2, "0"), // Months are 0-based
        String(maxExpireIn.getDate()).padStart(2, "0"),
    ].join("-");

    // Formatting the time to HH:MM
    const maxExpireInTime = [
        String(maxExpireIn.getHours()).padStart(2, "0"),
        String(maxExpireIn.getMinutes()).padStart(2, "0"),
    ].join(":");

    const infoTooltipText: {
        title: string;
        message: string;
        expire: string;
        maxViews: string;
        maxDownloads: string;
        allowDelete: string;
    } = {
        title: `Enter the title for the transfer. Maximum ${maxTitleLength} characters.`,
        message: `Write a message to accompany the transfer. Maximum ${maxMessageLength} characters.`,
        expire: `Choose a date and time for the transfer to expire on. The maximum expiry time you can set is ${maxExpireInAsStr} from now.`,
        maxViews: `Set the maximum number of views allowed for the transfer. Between ${maxViewsMin} and ${maxViewsMax} views.`,
        maxDownloads: `Set the maximum number of downloads allowed for the transfer. Between ${maxDownloadsMin} and ${maxDownloadsMax} downloads.`,
        allowDelete: `Choose whether the transfer can be deleted before it expires. This option is available when the transfer is received.`,
    };

    const [files, setFiles] = React.useState<File[]>([]);
    const [showAdvanced, setShowAdvanced] = React.useState<boolean>(false);
    const [progressState, setProgressState] = React.useState<{
        status: string;
        progress: number;
    }>({ status: "no status", progress: 0 });

    const [transferId, setTransferId] = React.useState<string | null>(null);

    type ValidationSchemaType = z.infer<typeof TransferFormSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<ValidationSchemaType>({
        resolver: zodResolver(TransferFormSchema),
        defaultValues: {
            title: "",
            message: "",
            expiryDate: maxExpireInDate,
            expiryTime: maxExpireInTime,
            maxViews: whizfileConfig.api.transfer.maxViewsMax,
            maxDownloads: whizfileConfig.api.transfer.maxDownloadsMax,
            allowDelete: false,
        },
    });

    const titleValue = watch("title");
    const messageValue = watch("message");

    function mergeExpiryErrors() {
        let errorMessage = "";

        if (errors.expiryDate) {
            errorMessage += errors.expiryDate.message + " ";
        }

        if (errors.expiryTime) {
            errorMessage += errors.expiryTime.message;
        }

        return errorMessage.trim(); // Removes extra spaces if only one error exists
    }

    const mutation = useMutation({
        mutationFn: async (transferUpload: {
            title: string;
            message: string;
            allowDelete: boolean;
            maxViews: number;
            maxDownloads: number;
            expireIn: number;
            files: File[];
        }) => {
            setProgressState({
                status: "zipping",
                progress: 0,
            });

            const zip = new JSZip();
            transferUpload.files.forEach((file, index) => {
                zip.file(file.name, file);
                setProgressState({
                    status: "zipping",
                    progress: ((index + 1) / transferUpload.files.length) * 100,
                });
            });
            const archive: Blob = await zip.generateAsync({ type: "blob" });

            setProgressState({
                status: "hashing",
                progress: 0,
            });

            const archiveHash: string | undefined = await hashBlob(archive);

            setProgressState({
                status: "hashing",
                progress: 100,
            });

            if (!archiveHash) throw new Error();

            const data: zod.infer<typeof TransfersReq> = {
                title: transferUpload.title,
                message: transferUpload.message,
                allowDelete: transferUpload.allowDelete,
                maxViews: transferUpload.maxViews,
                maxDownloads: transferUpload.maxDownloads,
                expireIn: transferUpload.expireIn,
                objectData: {
                    size: archive.size,
                    fileHash: archiveHash,
                },
            };

            const transferResp = await axiosInstance.post(
                "/api/transfers",
                data,
                {
                    onUploadProgress: (e: AxiosProgressEvent) => {
                        const percentCompleted = Math.round(
                            (e.loaded * 100) / (e.total || 100)
                        );

                        setProgressState({
                            status: "creating transfer",
                            progress: percentCompleted,
                        });
                    },
                }
            );

            const transferData: {
                transferId: string;
                method: string;
                url: string;
            } = {
                transferId: transferResp.data.data.transferId,
                method: transferResp.data.data.upload.method,
                url: transferResp.data.data.upload.url,
            };

            const putResp = await axiosInstance.put(transferData.url, archive, {
                headers: { "Content-Type": archive.type },
                onUploadProgress: (e: AxiosProgressEvent) => {
                    const percentCompleted = Math.round(
                        (e.loaded * 100) / (e.total || 100)
                    );

                    setProgressState({
                        status: "uploading files",
                        progress: percentCompleted,
                    });
                },
            });

            setProgressState({
                status: "completing transfer",
                progress: 0,
            });

            setTransferId(transferData.transferId);

            setProgressState({
                status: "completing transfer",
                progress: 100,
            });
        },
    });

    const onSubmit: SubmitHandler<ValidationSchemaType> = (
        data: ValidationSchemaType
    ) => {
        const expiryDateTime = new Date(
            `${data.expiryDate}T${data.expiryTime}`
        );

        mutation.mutate({
            title: data.title,
            message: data.message,
            allowDelete: data.allowDelete,
            maxViews: data.maxViews,
            maxDownloads: data.maxDownloads,
            expireIn: Number(expiryDateTime) - Date.now(),
            files,
        });

        mutation.isSuccess = true;
    };

    if (mutation.isSuccess || transferId) {
        return (
            <main className="w-full h-full flex flex-row justify-center items-center">
                <Card className="flex flex-col items-center justify-center">
                    <CardHeader className="h-fit w-full">
                        <CardTitle as="h1" className="text-primary text-center">
                            transfer sent
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="w-full flex flex-col items-center justify-center gap-5">
                        <div className="flex flex-col items-center justify-center">
                            <p>your transfer has been sent!</p>
                        </div>
                        <TransferLink
                            className="text-lg text-gray-500 font-semibold italic outline rounded-lg p-1"
                            tooltipText="click to copy"
                            copyText={`${BASE_URL}/receive/${transferId}`}
                            displayText={`${BASE_URL}/receive/${transferId}`}
                        ></TransferLink>
                        <button
                            onClick={() => {
                                setFiles([]);
                                reset();
                                mutation.reset();
                                setTransferId(null);
                            }}
                            className="h-fit w-fit bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                        >
                            send another?
                        </button>
                    </CardContent>
                </Card>
            </main>
        );
    } else if (mutation.isPending) {
        return (
            <main className="w-full h-full flex flex-row justify-center items-center">
                <Card className="flex flex-col items-center justify-center">
                    <CardHeader className="h-fit w-full">
                        <CardTitle as="h1" className="text-primary text-center">
                            transfering...
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="w-full flex flex-row items-center justify-center">
                        <div className="w-full h-full flex flex-col items-center justify-center gap-5">
                            <PulseLoader
                                color="#4539cd"
                                size={20}
                                speedMultiplier={0.5}
                            />
                            <div className="flex flex-col items-center justify-center">
                                <p className="">{progressState.status}...</p>
                                <p className="text-sm italic">
                                    {progressState.progress}% done
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        );
    } else if (mutation.isError) {
        return (
            <main className="w-full h-full flex flex-row justify-center items-center">
                <Card className="flex flex-col items-center justify-center">
                    <CardHeader className="h-fit w-full">
                        <CardTitle as="h1" className="text-primary text-center">
                            transfer error
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="w-full h-full flex flex-col gap-2 items-center justify-center">
                        <h2>
                            uh oh! it looks like there was an error processing
                            your transfer...
                        </h2>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            className="h-fit w-fit bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                        >
                            try again
                        </button>
                    </CardContent>
                </Card>
            </main>
        );
    } else {
        return (
            <main className="w-full h-full flex flex-row justify-center items-center">
                <Card className="flex flex-col items-center justify-center">
                    <CardTitle className="p-6 text-primary font-extrabold">
                        send
                    </CardTitle>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="w-full h-5/6 overflow-visible sm:overflow-visible sm:h-full flex flex-col sm:flex-row"
                    >
                        <CardContent className="w-full sm:w-1/2 h-full flex flex-col items-center justify-start sm:px-6 sm:pr-3">
                            <div className="w-full h-full flex flex-col gap-3">
                                <div className="flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-row gap-1 justify-start items-center">
                                            <label
                                                htmlFor="title"
                                                className="text-sm font-bold text-primary italic"
                                            >
                                                title
                                            </label>
                                            <Tooltip
                                                tooltipText={
                                                    infoTooltipText.title
                                                }
                                            >
                                                <Icons.info
                                                    fill="#4539cd"
                                                    width={20}
                                                    height={20}
                                                />
                                            </Tooltip>
                                        </div>
                                        <p
                                            className={`text-xs font-semibold italic text-primary ${
                                                titleValue.length >
                                                maxTitleLength
                                                    ? "text-red-500"
                                                    : ""
                                            }`}
                                        >
                                            {titleValue.length}/{maxTitleLength}
                                        </p>
                                    </div>
                                    <input
                                        type="text"
                                        id="title"
                                        className={`block w-full border border-gray-400 rounded-md shadow-sm p-1 text-gray-700 ${
                                            errors.title ? "border-red-500" : ""
                                        }`}
                                        placeholder="title"
                                        {...register("title")}
                                    />
                                    {errors.title && (
                                        <span className="text-xs font-semibold italic text-red-500">
                                            {errors.title.message}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-row gap-1 justify-start items-center">
                                            <label
                                                htmlFor="message"
                                                className="text-sm font-bold text-primary italic"
                                            >
                                                message{" "}
                                            </label>
                                            <Tooltip
                                                tooltipText={
                                                    infoTooltipText.message
                                                }
                                            >
                                                <Icons.info
                                                    fill="#4539cd"
                                                    width={20}
                                                    height={20}
                                                />
                                            </Tooltip>
                                        </div>
                                        <p
                                            className={`text-xs font-semibold italic text-primary ${
                                                messageValue.length >
                                                maxMessageLength
                                                    ? "text-red-500"
                                                    : ""
                                            }`}
                                        >
                                            {messageValue.length}/
                                            {maxMessageLength}
                                        </p>
                                    </div>
                                    <textarea
                                        id="message"
                                        className={`flex-grow border border-gray-400 rounded-md shadow-sm p-1 custom-scrollbar resize-y sm:resize-none text-gray-700 ${
                                            errors.message
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                        placeholder="message"
                                        {...register("message")}
                                    />
                                    {errors.message && (
                                        <span className="text-xs font-semibold italic text-red-500">
                                            {errors.message.message}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAdvanced(!showAdvanced)
                                    }
                                    className="flex flex-row w-fit items-center justify-start text-sm font-bold text-primary italic gap-1 cursor-pointer"
                                >
                                    advanced options
                                    <div
                                        className={
                                            showAdvanced ? "" : "rotate-180"
                                        }
                                    >
                                        <Icons.chevronDown
                                            className="rotate-90"
                                            fill="#4539cd"
                                            width={24}
                                            height={24}
                                        />
                                    </div>
                                </button>
                                {showAdvanced && (
                                    <>
                                        <div className="flex flex-col">
                                            <div className="flex flex-row gap-1 justify-start items-center">
                                                <label className="block text-sm font-bold text-primary italic">
                                                    expire on
                                                </label>
                                                <Tooltip
                                                    tooltipText={
                                                        infoTooltipText.expire
                                                    }
                                                >
                                                    <Icons.info
                                                        fill="#4539cd"
                                                        width={20}
                                                        height={20}
                                                    />
                                                </Tooltip>
                                            </div>
                                            <div className="flex flex-row items-center justify-start gap-2">
                                                <input
                                                    type="date"
                                                    id="expiryDate"
                                                    className={`block w-fit border border-gray-400 rounded-md shadow-sm p-1 text-gray-700 ${
                                                        errors.expiryDate
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                    aria-labelledby="expiryLabel"
                                                    {...register("expiryDate")}
                                                />
                                                <p className="text-primary italic">
                                                    at
                                                </p>
                                                <input
                                                    type="time"
                                                    id="expiryTime"
                                                    className={`block w-fit border border-gray-400 rounded-md shadow-sm p-1 text-gray-700 ${
                                                        errors.expiryDate
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                    aria-labelledby="expiryLabel"
                                                    {...register("expiryTime")}
                                                />
                                            </div>
                                            {(errors.expiryDate ||
                                                errors.expiryTime) && (
                                                <span className="text-xs font-semibold italic text-red-500">
                                                    {mergeExpiryErrors()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-row items-center justify-start gap-4">
                                            <div className="flex flex-col">
                                                <div className="flex flex-row gap-1 justify-start items-center">
                                                    <label
                                                        htmlFor="maxViews"
                                                        className="block text-sm font-bold text-primary italic"
                                                    >
                                                        max views
                                                    </label>
                                                    <Tooltip
                                                        tooltipText={
                                                            infoTooltipText.maxViews
                                                        }
                                                    >
                                                        <Icons.info
                                                            fill="#4539cd"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </Tooltip>
                                                </div>
                                                <input
                                                    type="number"
                                                    id="maxViews"
                                                    className={`block w-fit border border-gray-400 rounded-md shadow-sm p-1 text-gray-700 ${
                                                        errors.maxViews
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                    min={maxViewsMin}
                                                    max={maxViewsMax}
                                                    {...register("maxViews")}
                                                />
                                                {errors.maxViews && (
                                                    <span className="text-xs font-semibold italic text-red-500">
                                                        {
                                                            errors.maxViews
                                                                .message
                                                        }
                                                    </span>
                                                )}
                                                {errors.maxDownloads &&
                                                    !errors.maxViews && (
                                                        <span className="text-xs font-semibold italic text-transparent select-none">
                                                            null
                                                        </span>
                                                    )}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex flex-row gap-1 justify-start items-center">
                                                    <label
                                                        htmlFor="maxDownloads"
                                                        className="block text-sm font-bold text-primary italic"
                                                    >
                                                        max downloads
                                                    </label>
                                                    <Tooltip
                                                        tooltipText={
                                                            infoTooltipText.maxDownloads
                                                        }
                                                    >
                                                        <Icons.info
                                                            fill="#4539cd"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </Tooltip>
                                                </div>
                                                <input
                                                    type="number"
                                                    id="maxDownloads"
                                                    className={`block w-fit border border-gray-400 rounded-md shadow-sm p-1 text-gray-700 ${
                                                        errors.maxDownloads
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                    min={maxDownloadsMin}
                                                    max={maxDownloadsMax}
                                                    {...register(
                                                        "maxDownloads"
                                                    )}
                                                />
                                                {errors.maxDownloads && (
                                                    <span className="text-xs font-semibold italic text-red-500">
                                                        {
                                                            errors.maxDownloads
                                                                .message
                                                        }
                                                    </span>
                                                )}
                                                {errors.maxViews &&
                                                    !errors.maxDownloads && (
                                                        <span className="text-xs font-semibold italic text-transparent select-none">
                                                            null
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                        <div className="flex flex-row items-center gap-2">
                                            <div className="flex flex-row gap-1 justify-start items-center">
                                                <label
                                                    htmlFor="allowDelete"
                                                    className="text-sm font-bold text-primary italic"
                                                >
                                                    allow delete
                                                </label>
                                                <Tooltip
                                                    tooltipText={
                                                        infoTooltipText.allowDelete
                                                    }
                                                >
                                                    <Icons.info
                                                        fill="#4539cd"
                                                        width={20}
                                                        height={20}
                                                    />
                                                </Tooltip>
                                            </div>
                                            <input
                                                type="checkbox"
                                                id="allowDelete"
                                                className="rounded text-primary focus:ring-primary"
                                                {...register("allowDelete")}
                                            />
                                            {errors.allowDelete && (
                                                <span className="text-xs font-semibold italic text-red-500">
                                                    {errors.allowDelete.message}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                                {/* <div className="hidden sm:flex"> */}
                                <input
                                    type="submit"
                                    value="get a link"
                                    className="cursor-pointer h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                                />
                                {/* </div> */}
                            </div>
                        </CardContent>
                        <CardContent className="w-full sm:w-1/2 h-full flex flex-col items-center justify-center sm:px-6 sm:pl-3">
                            <DropZone
                                files={files}
                                setFiles={setFiles}
                            ></DropZone>
                        </CardContent>
                        {/* <div className="flex sm:hidden px-3">
                            <input
                                type="submit"
                                value="get a link"
                                className="cursor-pointer h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                            />
                        </div> */}
                    </form>
                </Card>
            </main>
        );
    }
}
