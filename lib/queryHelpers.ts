export function createFilterClause(params: Record<string, string>) {
  const filterClause: Record<string, any> = {};

  if (params.search) {
    filterClause.name = { contains: params.search, mode: "insensitive" };
  }

  if (params.genreId) {
    filterClause.genreId = params.genreId;
  }

  if (params.vstId) {
    filterClause.vstId = params.vstId;
  }

  return filterClause;
}
