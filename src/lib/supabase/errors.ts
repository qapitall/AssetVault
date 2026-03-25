export function getSupabaseFriendlyError(message: string, code?: string): string {
  console.error('[Supabase error]', code ? `code=${code}` : '', message);

  const normalized = message.toLowerCase();

  if (
    normalized.includes("could not find the table") ||
    normalized.includes("in the schema cache") ||
    (normalized.includes("relation") && normalized.includes("does not exist"))
  ) {
    return 'Database schema is missing or outdated. Run the SQL in supabase/migrations/00001_initial_schema.sql on your Supabase project, then refresh the API schema cache.';
  }

  if (code === '23503') {
    return 'Operation failed: a required related record does not exist.';
  }

  if (code === '42501' || normalized.includes('row-level security') || normalized.includes('permission denied')) {
    return 'Permission denied. Please sign out and sign back in.';
  }

  return 'An unexpected error occurred. Please try again.';
}