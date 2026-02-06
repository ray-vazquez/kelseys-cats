import { CatService } from "../services/CatService.js";

export async function exportCatsCsv(req, res, next) {
  try {
    const csv = await CatService.exportAllCatsToCsv();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="kelseys-cats-export.csv"',
    );

    res.send(csv);
  } catch (err) {
    next(err);
  }
}
