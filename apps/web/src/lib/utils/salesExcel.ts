import ExcelJS from "exceljs";
import { GroupedSale } from "@/lib/types/index";

export const exportToExcel = async (
  filteredSales: GroupedSale[],
  exportFrom: Date,
  exportTo: Date
) => {
  const fromStr = exportFrom.toLocaleDateString();
  const toStr = exportTo.toLocaleDateString();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sales Report");

  // Title
  sheet.mergeCells("A1", "G1");
  sheet.getCell("A1").value = "BAHAY BIRIA SALES REPORT";
  sheet.getCell("A1").alignment = { horizontal: "center" };
  sheet.getCell("A1").font = { bold: true, size: 14 };

  // Date Range
  sheet.mergeCells("A2", "G2");
  sheet.getCell("A2").value = `AS OF ${fromStr} - ${toStr}`;
  sheet.getCell("A2").alignment = { horizontal: "center" };
  sheet.getCell("A2").font = { bold: true, size: 12 };

  // Blank row
  sheet.addRow([]);

  // Headers
  const headers = [
    "Date",
    "Payment Method",
    "Menu Item",
    "Quantity",
    "Price per Unit",
    "Subtotal",
    "Total Sale Amount",
  ];
  const headerRow = sheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
    cell.border = borderAll();
  });

  // Data Rows
  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      const row = sheet.addRow([
        new Date(sale.date).toLocaleDateString(),
        sale.payment_method_name,
        item.menu_item_name,
        item.quantity,
        Number(item.price),
        item.quantity * Number(item.price),
        Number(sale.total_amount),
      ]);
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "center" };
        cell.border = borderAll();
      });
    });
  });

  // Total calculation
  const total = filteredSales.reduce((sum, sale) => {
    return (
      sum +
      sale.items.reduce(
        (itemSum, item) => itemSum + item.quantity * Number(item.price),
        0
      )
    );
  }, 0);

  const totalRow = sheet.addRow(["", "", "", "", "", "TOTAL:", total]);
  totalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "right" };
    cell.border = borderAll();
  });

  // Set column widths
  sheet.columns = [
    { width: 20 },
    { width: 18 },
    { width: 22 },
    { width: 10 },
    { width: 16 },
    { width: 15 },
    { width: 18 },
  ];

  // Export the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const { default: saveAs } = await import("file-saver");
  saveAs(blob, `Sales_Report_${fromStr}_to_${toStr}.xlsx`);
};

function borderAll(): Partial<ExcelJS.Borders> {
  return {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };
}
