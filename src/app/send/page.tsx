"use client";

import * as React from "react";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import whizfileConfig from "@/lib/config/config";

export default function Send() {
    const [title, setTitle] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [expiryDate, setExpiryDate] = React.useState(""); // for date
    const [expiryTime, setExpiryTime] = React.useState(""); // for time
    const [maxViews, setMaxViews] = React.useState<number>(999);
    const [maxDownloads, setMaxDownloads] = React.useState<number>(999);
    const [allowDelete, setAllowDelete] = React.useState<boolean>(false);

    const titleMaxLength = 50; // Maximum length for title
    const messageMaxLength = 500; // Maximum length for message

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
                <form onSubmit={handleSubmit} className="w-full h-full ">
                    <CardContent className="w-1/2 h-full flex flex-col items-center justify-start">
                        <CardTitle className="p-6 text-primary font-extrabold">
                            send
                        </CardTitle>
                        <div className="w-full h-full flex flex-col gap-3 p-3">
                            <div className="relative">
                                <label
                                    htmlFor="title"
                                    className="block text-sm font-bold text-primary italic"
                                >
                                    title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    className="block w-full border border-gray-400 rounded-md shadow-sm p-1"
                                    placeholder="title"
                                    value={title}
                                    onChange={handleTitleChange}
                                />
                                <p className="absolute right-1 bottom-1 text-xs">
                                    {title.length}/{titleMaxLength}
                                </p>
                            </div>
                            <div className="flex flex-col h-full relative">
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-bold text-primary italic"
                                >
                                    message
                                </label>
                                <textarea
                                    name="message"
                                    id="message"
                                    className="flex-grow border border-gray-400 rounded-md shadow-sm resize-none p-1"
                                    placeholder="message"
                                    value={message}
                                    onChange={handleMessageChange}
                                />
                                <p className="absolute right-1 bottom-1 text-xs">
                                    {message.length}/{messageMaxLength}
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <label className="block text-sm font-bold text-primary italic">
                                    expire
                                </label>
                                <div className="flex flex-row items-center justify-start gap-2">
                                    <p className="text-primary italic text-sm">
                                        on
                                    </p>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        id="expiryDate"
                                        className="block w-fit border border-gray-400 rounded-md shadow-sm p-1"
                                        value={expiryDate}
                                        onChange={handleDateChange}
                                        aria-labelledby="expiryLabel"
                                    />
                                    <p className="text-primary italic">at</p>
                                    <input
                                        type="time"
                                        name="expiryTime"
                                        id="expiryTime"
                                        className="block w-fit border border-gray-400 rounded-md shadow-sm p-1"
                                        value={expiryTime}
                                        onChange={handleTimeChange}
                                        aria-labelledby="expiryLabel"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-row items-center justify-start gap-4">
                                <div className="flex flex-col">
                                    <label
                                        htmlFor="maxViews"
                                        className="block text-sm font-bold text-primary italic"
                                    >
                                        max views
                                    </label>
                                    <input
                                        type="number"
                                        name="maxViews"
                                        id="maxViews"
                                        className="block w-fit border border-gray-400 rounded-md shadow-sm p-1"
                                        value={maxViews}
                                        onChange={handleMaxViewsChange}
                                        min={1}
                                        max={999}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label
                                        htmlFor="maxDownloads"
                                        className="block text-sm font-bold text-primary italic"
                                    >
                                        max downloads
                                    </label>
                                    <input
                                        type="number"
                                        name="maxDownloads"
                                        id="maxDownloads"
                                        className="block w-fit border border-gray-400 rounded-md shadow-sm p-1"
                                        value={maxDownloads}
                                        onChange={handleMaxDownloadsChange}
                                        min={1}
                                        max={999}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <label
                                    htmlFor="allowDelete"
                                    className="text-sm font-bold text-primary italic"
                                >
                                    allow delete
                                </label>
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
                    <CardContent className="w-1/2 h-full">
                        {/* Additional content can go here */}
                    </CardContent>
                </form>
            </Card>
        </main>
    );
}
