import { renderToBuffer } from "@react-pdf/renderer";
import { QuoteDocument } from "@/lib/pdf/quote-pdf";
import { getQuote } from "@/lib/queries/quotes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) {
    return new Response("Quote not found", { status: 404 });
  }

  const buffer = await renderToBuffer(<QuoteDocument quote={quote} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.quoteNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
