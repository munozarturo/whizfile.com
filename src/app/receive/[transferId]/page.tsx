import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Suspense } from "react";

if (!process.env.BASE_URL) {
  throw new Error("BASE_URL environment variable not defined.");
}

const baseUrl = process.env.BASE_URL;

async function Transfer({ transferId }: { transferId: string }) {
  // Wait for the playlists
  const res = await fetch(`${baseUrl}/api/transfer/${transferId}`);
  const transfer = await res.json();

  return (
    <div>
      <h1>{transfer.title}</h1>
      <p>{transfer.message}</p>
      <p>{transfer.createdAt}</p>
    </div>
  );
}

export default async function ReceiveTransferId(context: {
  params: { transferId: string };
}) {
  return (
    <main className="w-full h-full flex flex-row items-center justify-center">
      <Card className="w-3/5 h-3/4 flex flex-col">
        <CardHeader className="h-fit w-full">
          <CardTitle as="h1" className="text-primary text-4xl text-center">
            receive a transfer
          </CardTitle>
        </CardHeader>
        <Suspense fallback={"loading..."}>
          <Transfer transferId={context.params.transferId} />
        </Suspense>
      </Card>
    </main>
  );
}
