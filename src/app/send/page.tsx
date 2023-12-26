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
                        <CardContent className="w-full h-full flex flex-col gap-3">
                            <div>
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
                                    placeholder="Enter title"
                                    value={title}
                                    onChange={handleTitleChange}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-bold text-primary italic"
                                >
                                    message
                                </label>
                                <textarea
                                    name="message"
                                    id="message"
                                    className="block w-full border border-gray-400 rounded-md shadow-sm resize-vertical p-1"
                                    placeholder="Enter message"
                                    value={message}
                                    onChange={handleMessageChange}
                                    rows={4} // You can adjust the default number of rows
                                />
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
                                        className="block w-fit border border-gray-400 rounded-md shadow-sm"
                                        value={expiryDate}
                                        onChange={handleDateChange}
                                        aria-labelledby="expiryLabel"
                                    />
                                    <p className="text-primary italic">at</p>
                                    <input
                                        type="time"
                                        name="expiryTime"
                                        id="expiryTime"
                                        className="block w-fit border border-gray-400 rounded-md shadow-sm"
                                        value={expiryTime}
                                        onChange={handleTimeChange}
                                        aria-labelledby="expiryLabel"
                                    />
                                </div>
                            </div>
                            <input
                                type="submit"
                                value="get a link"
                                className="cursor-pointer h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                            />
                        </CardContent>
                    </CardContent>
                    <CardContent className="w-1/2 h-full">
                        {/* Additional content can go here */}
                    </CardContent>
                </form>
            </Card>
        </main>
    );
}
