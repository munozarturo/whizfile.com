export default function ReceiveTransferId(context: {
  params: { transferId: string };
}) {
  return (
    <main className="w-full h-full ">
      <h1>Receive {context.params.transferId}</h1>
    </main>
  );
}
