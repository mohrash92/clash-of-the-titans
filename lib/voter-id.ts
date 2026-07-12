const STORAGE_KEY = "clash-voter-id";

export function getVoterId(): string {
  const existingId = window.localStorage.getItem(STORAGE_KEY);

  if (existingId) {
    return existingId;
  }

  const newId = crypto.randomUUID();

  window.localStorage.setItem(STORAGE_KEY, newId);

  return newId;
}