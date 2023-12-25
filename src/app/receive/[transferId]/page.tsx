"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function ReceiveTransferId(context: {
    params: { transferId: string };
}) {
    return (
        <main className="w-full h-full flex flex-row items-center justify-center">
            <Card className="w-3/5 h-3/4 flex flex-col"></Card>
        </main>
    );
}
