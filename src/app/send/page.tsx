"use client";

import * as React from "react";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import DropZone from "@/components/dropzone";
import { Icons } from "@/components/icons";
import { Tooltip } from "@/components/tooltip";
import whizfileConfig from "@/lib/config/config";

function formatExpireTime(milliseconds: number) {
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

export default function Send() {
    // maxSize: number; // in bytes

    const {
        maxTitleLength,
        maxMessageLength,
        maxDownloadsMin,
        maxDownloadsMax,
        maxViewsMin,
        maxViewsMax,
        expireInMin,
        expireInMax,
    } = whizfileConfig.api.transfer;

    const maxExpireInAsStr: string = formatExpireTime(expireInMax);
    const maxExpireIn: Date = new Date(Date.now() + expireInMax);
    // Formatting the date to YYYY-MM-DD
    const maxExpireInDate = maxExpireIn.toISOString().split("T")[0];
    // Formatting the time to HH:MM
    const maxExpireInTime = maxExpireIn
        .toISOString()
        .split("T")[1]
        .substring(0, 5);

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

    const [title, setTitle] = React.useState<string>("");
    const [message, setMessage] = React.useState<string>("");
    const [expiryDate, setExpiryDate] = React.useState<string>(maxExpireInDate); // for date
    const [expiryTime, setExpiryTime] = React.useState<string>(maxExpireInTime); // for time
    const [maxViews, setMaxViews] = React.useState<number>(maxViewsMax);
    const [maxDownloads, setMaxDownloads] =
        React.useState<number>(maxDownloadsMax);
    const [allowDelete, setAllowDelete] = React.useState<boolean>(false);
    const [files, setFiles] = React.useState<File[]>([]);

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    const handleMessageChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setMessage(event.target.value);
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setExpiryDate(event.target.value);
    };

    const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setExpiryTime(event.target.value);
    };

    const handleMaxViewsChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setMaxViews(parseInt(event.target.value, 10) || 0);
    };

    const handleMaxDownloadsChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setMaxDownloads(parseInt(event.target.value, 10) || 0);
    };

    const handleAllowDeleteChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setAllowDelete(event.target.checked);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    return (
        <main className="w-full h-full flex flex-row justify-center items-center">
            <Card className="w-3/5 h-3/4 flex flex-row">
                <form
                    onSubmit={handleSubmit}
                    className="w-full h-full flex flex-row"
                >
                    <CardContent className="w-1/2 h-full flex flex-col items-center justify-start">
                        <CardTitle className="p-6 text-primary font-extrabold">
                            send
                        </CardTitle>
                        <div className="w-full h-full flex flex-col gap-3 px-3 pb-3">
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-row gap-1 justify-start items-center">
                                        <label
                                            htmlFor="title"
                                            className="text-sm font-bold text-primary italic"
                                        >
                                            title
                                        </label>
                                        <Tooltip
                                            tooltipText={infoTooltipText.title}
                                        >
                                            <Icons.info
                                                fill="#4539cd"
                                                width={20}
                                                height={20}
                                            />
                                        </Tooltip>
                                    </div>
                                    <p className="text-xs">
                                        {title.length}/{maxTitleLength}
                                    </p>
                                </div>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    className="block w-full border border-gray-400 rounded-md shadow-sm p-1 text-gray-700"
                                    placeholder="title"
                                    value={title}
                                    onChange={handleTitleChange}
                                />
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
                                    <p className="text-xs">
                                        {message.length}/{maxMessageLength}
                                    </p>
                                </div>
                                <textarea
                                    name="message"
                                    id="message"
                                    className="flex-grow border border-gray-400 rounded-md shadow-sm p-1 custom-scrollbar resize-none text-gray-700"
                                    placeholder="message"
                                    value={message}
                                    onChange={handleMessageChange}
                                />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex flex-row gap-1 justify-start items-center">
                                    <label className="block text-sm font-bold text-primary italic">
                                        expire on
                                    </label>
                                    <Tooltip
                                        tooltipText={infoTooltipText.expire}
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
                                        name="expiryDate"
                                        id="expiryDate"
                                        className="block w-fit border border-gray-400 rounded-md shadow-sm p-1 text-gray-700"
                                        value={expiryDate}
                                        onChange={handleDateChange}
                                        aria-labelledby="expiryLabel"
                                    />
                                    <p className="text-primary italic">at</p>
                                    <input
                                        type="time"
                                        name="expiryTime"
                                        id="expiryTime"
                                        className="block w-fit border border-gray-400 rounded-md shadow-sm p-1 text-gray-700"
                                        value={expiryTime}
                                        onChange={handleTimeChange}
                                        aria-labelledby="expiryLabel"
                                    />
                                </div>
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
                                        name="maxViews"
                                        id="maxViews"
                                        className="block w-fit border border-gray-400 rounded-md shadow-sm p-1 text-gray-700"
                                        value={maxViews}
                                        onChange={handleMaxViewsChange}
                                        min={maxViewsMin}
                                        max={maxViewsMax}
                                    />
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
                                        name="maxDownloads"
                                        id="maxDownloads"
                                        className="block w-fit border border-gray-400 rounded-md shadow-sm p-1 text-gray-700"
                                        value={maxDownloads}
                                        onChange={handleMaxDownloadsChange}
                                        min={maxDownloadsMin}
                                        max={maxDownloadsMax}
                                    />
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
                                    name="allowDelete"
                                    id="allowDelete"
                                    className="rounded text-primary focus:ring-primary"
                                    checked={allowDelete}
                                    onChange={handleAllowDeleteChange}
                                />
                            </div>
                            <input
                                type="submit"
                                value="get a link"
                                className="cursor-pointer h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                            />
                        </div>
                    </CardContent>
                    <CardContent className="w-1/2 h-full flex flex-col items-center justify-center p-6 pl-0">
                        <DropZone files={files} setFiles={setFiles} />
                    </CardContent>
                </form>
            </Card>
        </main>
    );
}
