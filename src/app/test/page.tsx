"use client";

import * as React from "react";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import Link from "next/link";

export default function Test() {
    return (
        <main className="w-full h-full flex flex-row justify-center items-center">
            <Card className="flex flex-col items-center justify-center">
                <CardHeader className="h-fit w-full">
                    <CardTitle as="h1" className="text-primary text-center">
                        404, not found
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <h2>uh oh! it looks like you&apos;re lost...</h2>
                </CardContent>
                <CardFooter>
                    <Link
                        href="/."
                        className="group transition duration-300 text-center text-white text-lg font-bold italic bg-primary p-2 rounded-xl"
                    >
                        take me home
                    </Link>
                </CardFooter>
            </Card>
        </main>
    );
}
