export function isValidAttachment(fields: any[] | undefined) {
  return !fields || fields.every((field) => field.isValid);
}

export function isValidFileType(fields: any[] | undefined) {
  return (
    !fields ||
    fields.every((field) =>
      ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(field.file?.type)
    )
  );
}

const MAX_TOTAL_FILE_SIZE = 52428800; // 50m
export function isUnderTotalFileSize(fields: any[] | undefined) {
  return !fields || fields.reduce((acc, curr) => acc + curr.size, 0) < MAX_TOTAL_FILE_SIZE;
}

export function hasVirus(fields: any[] | undefined) {
  return !fields || fields.find((field) => field.substatus === 'VIRUS') !== undefined;
}

export function isPasswordProtected(fields: any[] | undefined) {
  return !fields || fields.find((field) => field.substatus === 'PASSWORD_PROTECTED') !== undefined;
}
