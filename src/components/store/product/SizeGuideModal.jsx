import React from "react";
import { Link } from "react-router-dom";
import Modal from "../../ui/Modal";
import WhatsAppIcon from "../../ui/WhatsAppIcon";
import { waLink } from "../../../lib/whatsapp";

const sizeKey = (s) => String(s ?? "").trim().toLowerCase();

export default function SizeGuideModal({ open, onClose, guide, product, settings }) {
  const offered = new Set((product?.sizes || []).map(sizeKey));
  const columns = guide?.columns || [];
  const rows = guide?.rows || [];
  const isOffered = (row) => offered.has(sizeKey(row[0]));
  // Only set the product's sizes apart when the chart has both kinds of row.
  const marking = rows.some(isOffered) && rows.some((row) => !isOffered(row));
  const enquiry = waLink(settings?.whatsappNumber, `Hi ${settings?.storeName || "Al Habib Garments Mall"}, which size of the ${product?.title || "piece"} would fit me?`);

  return (
    <Modal open={open} onClose={onClose} title={guide?.title || "Size guide"} size="md">
      {guide && columns.length ? (
        <>
          <p className="text-sm text-neutral-600">
            {marking ? "Sizes offered for this piece are in bold; the rest are there to compare. " : ""}
            Measurements are of the garment unless the column says otherwise.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[20rem] text-sm">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c} scope="col" className="border-b border-ink py-2.5 pr-4 text-left text-2xs font-medium uppercase tracking-micro text-ink last:pr-0">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const muted = marking && !isOffered(row);
                  const [size, ...cells] = row;
                  return (
                    <tr key={`${size}-${i}`} className={`border-b border-line ${muted ? "text-neutral-500" : "text-ink"}`}>
                      <th scope="row" className={`py-2.5 pr-4 text-left tabular-nums ${muted ? "font-normal" : "font-semibold"}`}>
                        {size}
                        {muted && <span className="sr-only"> (not offered)</span>}
                      </th>
                      {cells.map((cell, j) => (
                        <td key={`${j}-${cell}`} className="py-2.5 pr-4 tabular-nums last:pr-0">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {guide.note && <p className="mt-4 text-xs leading-relaxed text-neutral-500">{guide.note}</p>}
        </>
      ) : (
        <p className="text-sm leading-relaxed text-neutral-700">We have not added a chart for this piece yet. Send us your usual size and height on WhatsApp and we will confirm the fit before you order.</p>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 border-t border-line pt-2 text-2xs font-medium uppercase tracking-micro">
        <Link to="/size-guide" className="inline-flex h-10 items-center underline underline-offset-4 hover:opacity-60" onClick={onClose}>
          All size guides
        </Link>
        <a href={enquiry} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 hover:opacity-60">
          <WhatsAppIcon className="h-4 w-4" color="#25D366" />
          Ask about fit
        </a>
      </div>
    </Modal>
  );
}
