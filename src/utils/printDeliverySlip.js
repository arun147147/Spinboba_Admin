import { formatCurrency } from "@/hooks/useCurrency";

/* =========================================================
   DELIVERY SLIP

   What the rider carries. Everything needed to find the door and
   hand over the right drinks - address, phone, the exact build of
   each item, and whether money still has to be collected.

   Printed from a detached iframe rather than a popup: no blocker
   to fall foul of, and the admin app's own stylesheet cannot leak
   in and reflow the page mid-print.
========================================================= */

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) => HTML_ESCAPES[character],
  );

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/* Written the way it would be read aloud to find the place: door
   first, then the building, then the locality. */
const addressLines = (address) => {
  if (!address) {
    return [];
  }

  return [
    [address.houseNo, address.apartment].filter(Boolean).join(", "),
    address.area,
    [address.town, address.city].filter(Boolean).join(", "),
    [address.state, address.pincode].filter(Boolean).join(" - "),
    address.country,
  ].filter((line) => line && line.trim().length > 0);
};

const optionsText = (options = []) =>
  options
    .map(
      (option) =>
        `${option.groupName}: ${option.optionName}${
          option.optionPrice > 0
            ? ` (+${formatCurrency(option.optionPrice)})`
            : ""
        }`,
    )
    .join(" · ");

const itemRows = (items = []) =>
  items
    .map((item) => {
      const options = optionsText(item.options);

      return `
        <tr>
          <td class="qty">${escapeHtml(item.quantity)}&times;</td>

          <td>
            <div class="product">${escapeHtml(item.productName)}</div>

            ${
              options
                ? `<div class="options">${escapeHtml(options)}</div>`
                : `<div class="options muted">No customisations</div>`
            }

            ${
              item.specialInstructions
                ? `<div class="note">Note: ${escapeHtml(
                    item.specialInstructions,
                  )}</div>`
                : ""
            }
          </td>

          <td class="amount">${escapeHtml(
            formatCurrency(item.totalPrice),
          )}</td>
        </tr>
      `;
    })
    .join("");

const totalRow = (label, value, strong = false) => `
  <tr class="${strong ? "strong" : ""}">
    <td colspan="2" class="total-label">${escapeHtml(label)}</td>
    <td class="total-amount">${escapeHtml(formatCurrency(value))}</td>
  </tr>
`;

const SLIP_STYLES = `
  @page { margin: 12mm; }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    font-size: 12px;
    color: #111827;
  }

  h1 { font-size: 16px; margin: 0; }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    border-bottom: 2px solid #111827;
    padding-bottom: 8px;
  }

  .order-id { font-size: 22px; font-weight: 800; }

  .meta { text-align: right; line-height: 1.6; }

  .section { margin-top: 14px; }

  .section-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .name { font-size: 15px; font-weight: 700; }

  .phone { font-size: 15px; font-weight: 700; }

  .address { line-height: 1.6; }

  .instruction {
    margin-top: 6px;
    padding: 6px 8px;
    border-left: 3px solid #f59e0b;
    background: #fef3c7;
  }

  .banner {
    margin-top: 12px;
    padding: 8px 10px;
    border: 2px solid #111827;
    font-weight: 800;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  table { width: 100%; border-collapse: collapse; }

  th {
    text-align: left;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
    border-bottom: 1px solid #d1d5db;
    padding: 4px 0;
  }

  td {
    padding: 6px 0;
    vertical-align: top;
    border-bottom: 1px solid #f3f4f6;
  }

  .qty { width: 34px; font-weight: 800; }

  .amount { text-align: right; white-space: nowrap; }

  .product { font-weight: 700; }

  .options { color: #374151; margin-top: 2px; }

  .muted { color: #9ca3af; }

  .note {
    margin-top: 3px;
    padding: 3px 6px;
    background: #fef3c7;
    display: inline-block;
  }

  .total-label,
  .total-amount { border-bottom: none; }

  .total-label { text-align: right; }

  .total-amount { text-align: right; white-space: nowrap; }

  .strong td {
    font-size: 15px;
    font-weight: 800;
    border-top: 2px solid #111827;
    padding-top: 8px;
  }

  .foot {
    margin-top: 18px;
    padding-top: 8px;
    border-top: 1px dashed #9ca3af;
    color: #6b7280;
  }
`;

const slipHtml = (order) => {
  const address = order.deliveryAddress;

  const lines = addressLines(address);

  /* Cash still to collect is the one thing that must not be
     missed, so it gets a banner rather than a table row. */
  const collectOnDelivery = order.paymentStatus !== "SUCCESS";

  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />

        <title>Order ${escapeHtml(
          order.orderNumber || order.orderId,
        )}</title>

        <style>${SLIP_STYLES}</style>
      </head>

      <body>
        <div class="head">
          <div>
            <h1>Spin Boba &mdash; Delivery Slip</h1>

            <div class="order-id">Order #${escapeHtml(
              order.orderId,
            )}</div>
          </div>

          <div class="meta">
            <div>${escapeHtml(order.orderNumber || "")}</div>

            <div>${escapeHtml(formatDateTime(order.createdAt))}</div>

            <div><strong>${escapeHtml(
              order.statusLabel || order.status || "",
            )}</strong></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Deliver to</div>

          <div class="name">${escapeHtml(
            address?.receiverName || order.customerName || "—",
          )}</div>

          <div class="phone">${escapeHtml(
            address?.mobile || order.customerMobile || "—",
          )}</div>

          ${
            lines.length > 0
              ? `<div class="address">${lines
                  .map(escapeHtml)
                  .join("<br />")}</div>`
              : `<div class="address muted">No delivery address on this
                   order &mdash; call the customer before setting
                   out.</div>`
          }

          ${
            address?.landmark
              ? `<div>Landmark: ${escapeHtml(address.landmark)}</div>`
              : ""
          }

          ${
            address?.addressType
              ? `<div class="muted">${escapeHtml(
                  address.addressType,
                )}</div>`
              : ""
          }

          ${
            address?.deliveryInstruction
              ? `<div class="instruction">${escapeHtml(
                  address.deliveryInstruction,
                )}</div>`
              : ""
          }
        </div>

        <div class="section">
          <div class="section-title">Items</div>

          <table>
            <thead>
              <tr>
                <th>Qty</th>
                <th>Product</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>

            <tbody>${itemRows(order.items)}</tbody>

            <tfoot>
              ${
                order.subtotal
                  ? totalRow("Subtotal", order.subtotal)
                  : ""
              }

              ${
                order.deliveryFee
                  ? totalRow("Delivery fee", order.deliveryFee)
                  : ""
              }

              ${
                order.discountAmount
                  ? totalRow("Discount", -order.discountAmount)
                  : ""
              }

              ${totalRow("Total", order.amount, true)}
            </tfoot>
          </table>
        </div>

        <div class="banner">
          ${
            collectOnDelivery
              ? `Collect ${escapeHtml(
                  formatCurrency(order.amount),
                )} &mdash; ${escapeHtml(
                  order.paymentMethod || "payment",
                )} (${escapeHtml(order.paymentStatus)})`
              : "Paid online &mdash; collect nothing"
          }
        </div>

        <div class="foot">
          Printed ${escapeHtml(formatDateTime(new Date()))}
        </div>
      </body>
    </html>`;
};

export const printDeliverySlip = (order) => {
  const frame = document.createElement("iframe");

  frame.setAttribute("aria-hidden", "true");

  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";

  /* Attached before the document is handed over, so a fast parse
     cannot fire load before anyone is listening. */
  frame.addEventListener("load", () => {
    const view = frame.contentWindow;

    if (!view) {
      frame.remove();

      return;
    }

    view.focus();
    view.print();

    /* print() blocks in most browsers, but Safari returns straight
       away, so the frame outlives the call by a beat. */
    setTimeout(() => frame.remove(), 1000);
  });

  frame.srcdoc = slipHtml(order);

  document.body.appendChild(frame);
};

export default printDeliverySlip;
