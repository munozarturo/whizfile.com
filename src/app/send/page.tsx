"use client";

import * as React from "react";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function Send() {
    // State to hold the title input value
    const [title, setTitle] = React.useState("");

    // Function to handle input changes
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    // Function to handle form submission
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Process the form data here
        console.log("Title:", title);
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
                                    className="block text-sm font-medium text-primary italic"
                                >
                                    title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    className="block w-full border border-gray-400 rounded-md shadow-sm"
                                    placeholder="Enter title"
                                    value={title}
                                    onChange={handleTitleChange}
                                />
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
