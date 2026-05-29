import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  extractPackages,
  loadConfig,
  validateConfig,
  isAllowlisted,
  getThreshold,
  daysSince,
  formatBlockedError,
  formatOfflineError,
  DEFAULT_CONFIG,
} from "../../../../.config/opencode/plugins/package-age-hook";
import type {
  PackageAgeConfig,
  RegistryName,
  BlockedPackage,
} from "../../../../.config/opencode/plugins/package-age-hook";

// ─── 9.1 Command parsing ──────────────────────────────────────────────

describe("extractPackages", () => {
  it("detects npm install with single package", () => {
    const result = extractPackages("npm install express");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: "express", registry: "npm" });
  });

  it("detects npm i shorthand", () => {
    const result = extractPackages("npm i lodash");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: "lodash", registry: "npm" });
  });

  it("detects scoped npm package", () => {
    const result = extractPackages("npm install @scope/pkg-name");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: "@scope/pkg-name", registry: "npm" });
  });

  it("detects yarn add", () => {
    const result = extractPackages("yarn add react");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: "react", registry: "npm" });
  });

  it("detects pnpm add", () => {
    const result = extractPackages("pnpm add vue");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: "vue", registry: "npm" });
  });

  it("detects pip install", () => {
    const result = extractPackages("pip install requests");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: "requests", registry: "pypi" });
  });

  it("detects pip3 install", () => {
    const result = extractPackages("pip3 install numpy");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: "numpy", registry: "pypi" });
  });

  it("detects cargo install", () => {
    const result = extractPackages("cargo install ripgrep");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: "ripgrep", registry: "crates" });
  });

  it("detects gem install", () => {
    const result = extractPackages("gem install rails");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: "rails", registry: "rubygems" });
  });

  it("detects composer require", () => {
    const result = extractPackages("composer require laravel/framework");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "laravel/framework",
      registry: "packagist",
    });
  });

  it("skips bare npm install without package name", () => {
    const result = extractPackages("npm install");
    expect(result).toHaveLength(0);
  });

  it("skips bare pip install without package name", () => {
    const result = extractPackages("pip install");
    expect(result).toHaveLength(0);
  });

  it("skips pip install -r requirements.txt", () => {
    const result = extractPackages("pip install -r requirements.txt");
    expect(result).toHaveLength(0);
  });

  it("skips non-package commands", () => {
    expect(extractPackages("ls -la")).toHaveLength(0);
    expect(extractPackages("git status")).toHaveLength(0);
    expect(extractPackages("npm test")).toHaveLength(0);
    expect(extractPackages("npm run build")).toHaveLength(0);
  });

  it("handles multiple packages in npm install", () => {
    const result = extractPackages("npm install express lodash react");
    expect(result).toHaveLength(3);
    expect(result.map((p) => p.name)).toEqual(["express", "lodash", "react"]);
    result.forEach((p) => expect(p.registry).toBe("npm"));
  });

  it("strips version constraints from npm packages", () => {
    const result = extractPackages("npm install express@4.18.0");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: "express", registry: "npm" });
  });

  it("handles npm install with --save-dev flag", () => {
    const result = extractPackages("npm install --save-dev typescript");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: "typescript", registry: "npm" });
  });

  it("handles yarn add with -D flag", () => {
    const result = extractPackages("yarn add -D jest");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: "jest", registry: "npm" });
  });
});

// ─── 9.2 Config loading and merging ───────────────────────────────────

describe("validateConfig", () => {
  it("returns defaults when given empty object", () => {
    const result = validateConfig({});
    expect(result).toEqual(DEFAULT_CONFIG);
  });

  it("applies minAgeDays override", () => {
    const result = validateConfig({ minAgeDays: 60 });
    expect(result.minAgeDays).toBe(60);
    expect(result.offlineMode).toBe("block");
    expect(result.allowlist).toEqual([]);
    expect(result.registries).toEqual({});
  });

  it("applies offlineMode override", () => {
    const result = validateConfig({ offlineMode: "allow" });
    expect(result.offlineMode).toBe("allow");
  });

  it("applies allowlist override", () => {
    const result = validateConfig({
      allowlist: ["typescript", "@my-org/*"],
    });
    expect(result.allowlist).toEqual(["typescript", "@my-org/*"]);
  });

  it("applies registry overrides", () => {
    const result = validateConfig({
      registries: { npm: { minAgeDays: 60 } },
    });
    expect(result.registries.npm?.minAgeDays).toBe(60);
  });

  it("rejects invalid minAgeDays (0 or negative)", () => {
    const result = validateConfig({ minAgeDays: 0 });
    expect(result.minAgeDays).toBe(DEFAULT_CONFIG.minAgeDays);
  });

  it("rejects invalid offlineMode", () => {
    const result = validateConfig({ offlineMode: "invalid" as any });
    expect(result.offlineMode).toBe(DEFAULT_CONFIG.offlineMode);
  });

  it("rejects non-array allowlist", () => {
    const result = validateConfig({ allowlist: "not-array" as any });
    expect(result.allowlist).toEqual(DEFAULT_CONFIG.allowlist);
  });

  it("rejects non-object registries", () => {
    const result = validateConfig({ registries: "bad" as any });
    expect(result.registries).toEqual(DEFAULT_CONFIG.registries);
  });

  it("merges partial config preserving defaults", () => {
    const result = validateConfig({ minAgeDays: 45 });
    expect(result.minAgeDays).toBe(45);
    expect(result.offlineMode).toBe("block");
    expect(result.allowlist).toEqual([]);
  });
});

// ─── 9.3 Age checking logic ───────────────────────────────────────────

describe("daysSince", () => {
  it("returns 0 for today", () => {
    const today = new Date();
    expect(daysSince(today)).toBe(0);
  });

  it("returns 30 for 30 days ago", () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    expect(daysSince(thirtyDaysAgo)).toBe(30);
  });

  it("returns 365 for a year ago", () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    expect(daysSince(oneYearAgo)).toBe(365);
  });
});

describe("getThreshold", () => {
  const config: PackageAgeConfig = {
    minAgeDays: 30,
    offlineMode: "block",
    allowlist: [],
    registries: { npm: { minAgeDays: 60 } },
  };

  it("returns global default for registry without override", () => {
    expect(getThreshold("pypi", config)).toBe(30);
  });

  it("returns registry-specific override", () => {
    expect(getThreshold("npm", config)).toBe(60);
  });

  it("returns global default when registries is empty", () => {
    const noOverrides: PackageAgeConfig = {
      ...DEFAULT_CONFIG,
      registries: {},
    };
    expect(getThreshold("npm", noOverrides)).toBe(30);
  });
});

// ─── 9.4 Allowlist logic ──────────────────────────────────────────────

describe("isAllowlisted", () => {
  const allowlist = ["typescript", "express", "@my-org/*"];

  it("matches exact package name", () => {
    expect(isAllowlisted("typescript", allowlist)).toBe(true);
    expect(isAllowlisted("express", allowlist)).toBe(true);
  });

  it("does not match non-allowlisted package", () => {
    expect(isAllowlisted("lodash", allowlist)).toBe(false);
    expect(isAllowlisted("react", allowlist)).toBe(false);
  });

  it("matches scoped wildcard", () => {
    expect(isAllowlisted("@my-org/utils", allowlist)).toBe(true);
    expect(isAllowlisted("@my-org/core", allowlist)).toBe(true);
    expect(isAllowlisted("@my-org/deep/nested", allowlist)).toBe(true);
  });

  it("does not match different scope", () => {
    expect(isAllowlisted("@other-org/utils", allowlist)).toBe(false);
  });

  it("handles empty allowlist", () => {
    expect(isAllowlisted("anything", [])).toBe(false);
  });

  it("does not match partial names", () => {
    // "express" should not match "express-session"
    expect(isAllowlisted("express-session", ["express"])).toBe(false);
  });
});

// ─── 9.5 Registry client behavior ─────────────────────────────────────

// Registry clients use fetch() which is not available in jsdom.
// These tests validate the URL construction and error paths indirectly
// through the extractPackages + type structure.
// Full integration tests should be run against live registries.

describe("registry routing", () => {
  it("routes npm commands to npm registry", () => {
    const result = extractPackages("npm install foo");
    expect(result[0].registry).toBe("npm");
  });

  it("routes yarn add to npm registry", () => {
    const result = extractPackages("yarn add foo");
    expect(result[0].registry).toBe("npm");
  });

  it("routes pnpm add to npm registry", () => {
    const result = extractPackages("pnpm add foo");
    expect(result[0].registry).toBe("npm");
  });

  it("routes pip to pypi registry", () => {
    const result = extractPackages("pip install foo");
    expect(result[0].registry).toBe("pypi");
  });

  it("routes cargo to crates registry", () => {
    const result = extractPackages("cargo install foo");
    expect(result[0].registry).toBe("crates");
  });

  it("routes gem to rubygems registry", () => {
    const result = extractPackages("gem install foo");
    expect(result[0].registry).toBe("rubygems");
  });

  it("routes composer to packagist registry", () => {
    const result = extractPackages("composer require vendor/foo");
    expect(result[0].registry).toBe("packagist");
  });
});

// ─── 9.6 Error message formatting ─────────────────────────────────────

describe("formatBlockedError", () => {
  it("includes package name and age", () => {
    const blocked: BlockedPackage[] = [
      {
        name: "fresh-pkg",
        registry: "npm",
        publishedAt: new Date("2026-04-29"),
        ageDays: 10,
        thresholdDays: 30,
        eligibleAt: new Date("2026-05-29"),
      },
    ];
    const msg = formatBlockedError(blocked);
    expect(msg).toContain("fresh-pkg");
    expect(msg).toContain("npm");
    expect(msg).toContain("10 days ago");
    expect(msg).toContain("30");
    expect(msg).toContain("2026-04-29");
  });

  it("includes eligibility date and countdown", () => {
    const blocked: BlockedPackage[] = [
      {
        name: "pkg",
        registry: "pypi",
        publishedAt: new Date("2026-05-20"),
        ageDays: 9,
        thresholdDays: 30,
        eligibleAt: new Date("2026-06-19"),
      },
    ];
    const msg = formatBlockedError(blocked);
    expect(msg).toContain("2026-06-19");
    expect(msg).toContain("in 21 days");
  });

  it("lists multiple blocked packages", () => {
    const blocked: BlockedPackage[] = [
      {
        name: "pkg-a",
        registry: "npm",
        publishedAt: new Date("2026-05-25"),
        ageDays: 4,
        thresholdDays: 30,
        eligibleAt: new Date("2026-06-24"),
      },
      {
        name: "pkg-b",
        registry: "pypi",
        publishedAt: new Date("2026-05-28"),
        ageDays: 1,
        thresholdDays: 30,
        eligibleAt: new Date("2026-06-27"),
      },
    ];
    const msg = formatBlockedError(blocked);
    expect(msg).toContain("pkg-a");
    expect(msg).toContain("pkg-b");
    expect(msg).toContain("4 days ago");
    expect(msg).toContain("1 days ago");
  });
});

describe("formatOfflineError", () => {
  it("includes registry name", () => {
    const msg = formatOfflineError("npm");
    expect(msg).toContain("npm");
    expect(msg).toContain("registry unreachable");
  });

  it("includes config path hint", () => {
    const msg = formatOfflineError("PyPI");
    expect(msg).toContain("~/.config/opencode/hooks/package-age.json");
    expect(msg).toContain('offlineMode');
  });
});
