export function canVibrate(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

export function canShare(): boolean {
  return typeof navigator !== "undefined" && "share" in navigator;
}
