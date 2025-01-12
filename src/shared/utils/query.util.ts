export function validateSort(
  sort: string,
  allowedFields: string[],
): {
  isValid: boolean;
  sortParams: [string, 1 | -1];
} {
  const [field, order] = sort.split(':');

  if (!allowedFields.includes(field)) {
    return { isValid: false, sortParams: ['createdAt', -1] };
  }

  return {
    isValid: true,
    sortParams: [field, order === 'asc' ? 1 : -1],
  };
}

export function sanitizeQuery(query: string): string {
  // Remove any potential MongoDB operators or injection attempts
  return query.replace(/[\${}()]/g, '').trim();
}
