function refreshRefillAccess() {
  // Avoid calling this same function recursively.
  const storefrontRefresh = window.aqRefreshDetailRefill;

  if (
    typeof storefrontRefresh === "function" &&
    storefrontRefresh !== refreshRefillAccess
  ) {
    storefrontRefresh();
  }
}