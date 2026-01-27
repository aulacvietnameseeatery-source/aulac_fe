export function useReceiptActions(orderId: string) {
  const downloadPdf = async () => {
    // const res = await fetch(`/api/orders/${orderId}/receipt`);
    // const blob = await res.blob();
    // const url = URL.createObjectURL(blob);

    // const a = document.createElement('a');
    // a.href = url;
    // a.download = `receipt-${orderId}.pdf`;
    // a.click();
  };

  const printReceipt = () => {
    window.print();
  };

  return {
    downloadPdf,
    printReceipt,
  };
}
