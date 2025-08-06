import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { InventoryItem } from "@/lib/types/index";

export const exportToExcel = async (
  inventory: InventoryItem[],
  exportFrom: Date | null,
  exportTo: Date | null
) => {
  if (!exportFrom || !exportTo) {
    alert("Please select both From and To dates.");
    return;
  }

  const filtered = inventory.filter((inv) => {
    const date = new Date(inv.created_at);
    return date >= exportFrom && date <= exportTo;
  });

  if (filtered.length === 0) {
    alert("No inventory found in selected range.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Inventory");

  const fromStr = exportFrom.toLocaleDateString();
  const toStr = exportTo.toLocaleDateString();

  // Title
  sheet.mergeCells("A1", "F1");
  sheet.getCell("A1").value = "BAHAY BIRIA INVENTORY";
  sheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  sheet.getCell("A1").font = { bold: true, size: 14 };

  // Date Range
  sheet.mergeCells("A2", "F2");
  sheet.getCell("A2").value = `AS OF ${fromStr} - ${toStr}`;
  sheet.getCell("A2").alignment = { horizontal: "center", vertical: "middle" };
  sheet.getCell("A2").font = { bold: true, size: 12 };

  // Headers
  const headers = [
    "Name",
    "Quantity",
    "Unit",
    "Cost per Unit",
    "Bought on",
    "Total Cost",
  ];
  sheet.addRow([]);
  const headerRow = sheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = borderAll();
  });

  // Data rows
  filtered.forEach((inv) => {
    const row = sheet.addRow([
      inv.name,
      inv.quantity,
      inv.unit,
      inv.cost_per_unit,
      new Date(inv.created_at).toLocaleDateString(),
      inv.quantity * inv.cost_per_unit,
    ]);
    row.eachCell((cell, colNumber) => {
      cell.alignment = {
        horizontal: colNumber === 1 ? "left" : "center",
        vertical: "middle",
      };
      cell.border = borderAll();
    });
  });

  // Total row
  const totalCost = filtered.reduce(
    (sum, inv) => sum + inv.quantity * inv.cost_per_unit,
    0
  );
  const totalRow = sheet.addRow(["", "", "", "", "TOTAL:", totalCost]);
  totalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = borderAll();
  });

  // Column widths
  sheet.columns = [
    { width: 25 },
    { width: 12 },
    { width: 10 },
    { width: 15 },
    { width: 20 },
    { width: 15 },
  ];

  // Save to file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `Inventory_Report_${fromStr}_to_${toStr}.xlsx`);
};

function borderAll(): Partial<ExcelJS.Borders> {
  return {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };
}
