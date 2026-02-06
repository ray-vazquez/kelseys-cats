import { CatsImportService } from "../services/CatsImportService.js";

export async function importPreview(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    const mime = req.file.mimetype;
    if (
      mime !== "text/csv" &&
      mime !== "application/vnd.ms-excel" // common for csv
    ) {
      return res.status(400).json({ error: "Invalid file type; CSV required" });
    }

    const previewRows = await CatsImportService.previewFromCsv(req.file.buffer);

    res.json({
      rows: previewRows,
      total: previewRows.length,
    });
  } catch (err) {
    next(err);
  }
}

export async function importConfirm(req, res, next) {
  try {
    const rows = req.body?.rows;
    if (!Array.isArray(rows) || !rows.length) {
      return res.status(400).json({ error: "No rows provided" });
    }

    const results = await CatsImportService.applyImport(rows);

    res.json(results);
  } catch (err) {
    next(err);
  }
}
