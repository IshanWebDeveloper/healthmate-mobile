/** Conventional Commits, e.g. "feat(records): add date range filter". */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      1,
      "always",
      [
        "db",
        "records",
        "dashboard",
        "settings",
        "ui",
        "theme",
        "deps",
        "config",
        "release",
      ],
    ],
    "body-max-line-length": [1, "always", 100],
  },
};
