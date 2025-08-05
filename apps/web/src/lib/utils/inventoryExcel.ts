import * as XLSX from "xlsx";
import { InventoryItem } from "@/lib/types/index";

export const exportToExcel = (
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
      alert("No sales found in selected range.");
      return;
    }

    const fromStr = exportFrom.toISOString().split("T")[0];
    const toStr = exportTo.toISOString().split("T")[0];

    const title = [`BAHAY BIRIA INVENTORY SALE`];
    const dateRange = [`AS OF ${fromStr} - ${toStr}`];
    const headers = [
      "Sale ID",
      "Name",
      "Unit",
      "Quantity",
      "Cost per Unit",
      "Created At",
      "Total Cost",
    ];

    const dataRows = filtered.map((inv) => [
      inv.id,
      inv.name,
      inv.unit,
      inv.quantity,
      inv.cost_per_unit,
      new Date(inv.created_at).toLocaleString(),
      inv.quantity * inv.cost_per_unit,
    ]);

    // Calculate total cost
    const totalCost = dataRows.reduce(
      (sum, row) => sum + Number(row[6] || 0),
      0
    );

    const worksheetData = [
      title,
      dateRange,
      [],
      headers,
      ...dataRows,
      [],
      ["", "", "", "", "", "TOTAL:", totalCost],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Merge title and date rows across all columns
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Merge title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Merge date range
    ];

    // Column widths
    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
    ];

    // Apply styling: headers, data, total row
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellRef];
        if (!cell) continue;

        // Title rows (first and second)
        if (R === 0 || R === 1) {
          cell.s = {
            font: { bold: true, sz: 14 },
            alignment: { horizontal: "center", vertical: "center" },
          };
        }

        // Column headers
        if (R === 3) {
          cell.s = {
            font: { bold: true },
            alignment: { horizontal: "center" },
            border: borderAll(),
          };
        }

        // Data & total rows
        if (R > 3) {
          cell.s = {
            alignment: { horizontal: "center" },
            border: borderAll(),
            ...(R === range.e.r &&
              C === 6 && {
                font: { bold: true },
              }),
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

  // Helper for border object
  function borderAll() {
    return {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    };
  }

