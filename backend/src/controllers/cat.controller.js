import { CatService } from "../services/CatService.js";

export async function listCats(req, res, next) {
  try {
    const rawPage = parseInt(req.query.page ?? "1", 10);
    const rawLimit = parseInt(req.query.limit ?? "12", 10);

    const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 12 : rawLimit;

    const filters = {
      page,
      limit,
      // Enable featured filter
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
    };

    // Support comma-separated status values for multi-status filtering
    if (req.query.status) {
      const statuses = req.query.status.split(',').map(s => s.trim()).filter(Boolean);
      if (statuses.length > 0) {
        filters.status = statuses.length === 1 ? statuses[0] : statuses;
      }
    }

    const result = await CatService.listCats(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}


export async function getCat(req, res, next) {
  try {
    const cat = await CatService.getCatWithTags(req.params.id);
    if (!cat) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(cat);
  } catch (err) {
    next(err);
  }
}

export async function createCat(req, res, next) {
  try {
    const cat = await CatService.createCat(req.body);
    res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
}

export async function updateCat(req, res, next) {
  try {
    const cat = await CatService.updateCat(req.params.id, req.body);
    if (!cat) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(cat);
  } catch (err) {
    next(err);
  }
}

export async function deleteCat(req, res, next) {
  try {
    await CatService.deleteCat(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function adoptCat(req, res, next) {
  try {
    const cat = await CatService.markAdopted(
      req.params.id,
      req.body.adoptiondate,
      req.body.adoptionstory,
    );
    if (!cat) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(cat);
  } catch (err) {
    next(err);
  }
}
