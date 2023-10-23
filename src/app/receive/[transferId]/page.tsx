export default function ReceiveTransferId(context: {
  params: { transferId: string };
}) {
  return (
    <>
      <h1>Receive {context.params.transferId}</h1>
    </>
  );
}
