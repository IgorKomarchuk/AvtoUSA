// tsx calls os.userInfo() on Windows to name its temporary directory. Some
// restricted service accounts do not expose that OS call, so provide the same
// numeric identifier path that tsx already uses on Unix.
if (typeof process.geteuid !== "function") {
  Object.defineProperty(process, "geteuid", { value: () => 0 });
}
