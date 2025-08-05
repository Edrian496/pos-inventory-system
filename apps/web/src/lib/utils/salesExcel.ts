import * as XLSX from "xlsx";
import { GroupedSale } from "@/lib/types/index";

export const exportToExcel = (
  filteredSales: GroupedSale[],
  exportFrom: Date,
  exportTo: Date
) => {
  const fromStr = exportFrom.toISOString().split("T")[0];
  const toStr = exportTo.toISOString().split("T")[0];

  const worksheetData = [
    [`BAHAY BIRIA SALES REPORT`],
    [`AS OF ${fromStr} - ${toStr}`],
    [],
    [
      "Sale ID",
      "Date",
      "Payment Method",
      "Menu Item",
      "Quantity",
      "Price per Unit",
      "Subtotal",
      "Total Sale Amount",
    ],
    ...filteredSales.flatMap((sale) =>
      sale.items.map((item) => [
        sale.sale_id,
        new Date(sale.date).toLocaleString(),
        sale.payment_method_name,
        item.menu_item_name,
        item.quantity,
        Number(item.price),
        item.quantity * Number(item.price),
        Number(sale.total_amount),
      ])
    ),
  ];

  const total = worksheetData
    .slice(4) // skip title, date, empty line, and headers
    .reduce((sum, row) => sum + Number(row[6] || 0), 0);

  worksheetData.push([], ["", "", "", "", "", "", "TOTAL:", total]);

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
  ];

  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 18 },
    { wch: 22 },
    { wch: 10 },
    { wch: 16 },
    { wch: 15 },
    { wch: 18 },
  ];

  const range = XLSX.utils.decode_range(worksheet["!ref"]!);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellRef];
      if (!cell) continue;

      if (R === 0 || R === 1) {
        cell.s = {
          font: { bold: true, sz: 14 },
          alignment: { horizontal: "center", vertical: "center" },
        };
      } else if (R === 3) {
        cell.s = {
          font: { bold: true },
          alignment: { horizontal: "center" },
          border: borderAll(),
        };
      } else if (R > 3) {
        cell.s = {
          alignment: { horizontal: "center" },
          border: borderAll(),
          ...(R === range.e.r && C === 7 ? { font: { bold: true } } : {}),
        };
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

  XLSX.writeFile(workbook, `Sales_Report_${fromStr}_to_${toStr}.xlsx`, {
    bookType: "xlsx",
    cellStyles: true,
  });
};

function borderAll() {
  return {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
  };
}
