// backend/src/controllers/alumni.controller.js
import { CatService } from "../services/CatService.js";

export async function listAlumni(req, res, next) {
  try {
    const rawPage = parseInt(req.query.page ?? "1", 10);
    const rawLimit = parseInt(req.query.limit ?? "12", 10);

    const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 12 : rawLimit;

    const filters = {
      status: "alumni", // force alumni
      senior:
        typeof req.query.senior === "string"
          ? req.query.senior === "true"
          : undefined,
      tags: req.query.tags ? req.query.tags.split(",") : undefined,
      page,
      limit,
    };

    const result = await CatService.listCats(filters);
    // result: { items, total, page, limit }

    if (req.query.year) {
      const year = parseInt(req.query.year, 10);
      const filteredItems = result.items.filter((c) => {
        if (!c.adoption_date) return false;
        const d = new Date(c.adoption_date);
        return d.getFullYear() === year;
      });

      return res.json({
        ...result,
        items: filteredItems,
        total: filteredItems.length,
      });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAlumni(req, res, next) {
  try {
    const cat = await CatService.getCatWithTags(req.params.id);
    if (!cat || cat.status !== "alumni") {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(cat);
  } catch (err) {
    next(err);
  }
}
