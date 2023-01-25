export function isValidAttachment(fields: any[] = []): boolean {
  return fields?.every((field) => field.isValid) === true;
}

export function isValidFileType(fields: any[] = []): boolean {
  return fields?.every((field) =>
    ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(field.file?.type)
  );
}

const MAX_TOTAL_FILE_SIZE = 52428800; // 50m
export function isUnderTotalFileSize(fields: any[] = []): boolean {
  return fields?.reduce((acc, curr) => acc + curr.size, 0) < MAX_TOTAL_FILE_SIZE;
}

export function hasVirus(fields: any[] = []): boolean {
  return fields?.find((field) => field.substatus === 'VIRUS' && field.status === 422) !== undefined;
}

export function isPasswordProtected(fields: any[] = []): boolean {
  return (
    fields?.find((field) => field.substatus === 'PASSWORD_PROTECTED' && field.status === 422) !==
    undefined
  );
}
