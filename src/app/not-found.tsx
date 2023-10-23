"use client";

import type { Metadata } from "next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import * as React from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 Not Found",
  description: "Content not found.",
};

export default function Send() {
  return (
    <main className="w-full h-full flex flex-row justify-center items-center">
      <Card className="w-3/5 h-3/4 flex flex-col items-center justify-center">
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
