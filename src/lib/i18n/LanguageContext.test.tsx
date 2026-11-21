import { fireEvent, render, screen } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  LanguageProvider,
  useLanguage,
} from "./LanguageContext";

// Simulate an Urdu dictionary that is missing keys present in English,
// which is exactly the drift the dev warning is meant to catch.
vi.mock("@/messages/ur.json", () => ({ default: {} }));

function Probe({ translationKey }: { translationKey: string }) {
  const { t } = useLanguage();
  return <span>{t(translationKey)}</span>;
}

function renderProbe(translationKey: string) {
  return render(
    <LanguageProvider>
      <Probe translationKey={translationKey} />
    </LanguageProvider>,
  );
}

describe("missing-translation warning", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("warns in development when a key exists in English but is missing in Urdu", () => {
    window.localStorage.setItem("locale", "ur");
    renderProbe("footer.text");

    // Rendered fallback is unchanged: the raw key path.
    expect(screen.getByText("footer.text")).not.toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Missing translation for key "footer.text"'),
    );
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('locale "ur"'),
    );
  });

  it("does not warn for keys that exist in the active locale", () => {
    renderProbe("footer.text");

    expect(screen.getByText(/Built with Next\.js and Supabase/)).not.toBeNull();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("does not warn for keys missing in English too", () => {
    window.localStorage.setItem("locale", "ur");
    renderProbe("does.not.exist");

    expect(screen.getByText("does.not.exist")).not.toBeNull();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("does not warn in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    window.localStorage.setItem("locale", "ur");
    renderProbe("navbar.brand");

    expect(screen.getByText("navbar.brand")).not.toBeNull();
    expect(console.warn).not.toHaveBeenCalled();
  });
});

function LocaleSwitcherProbe() {
  const { locale, setLocale } = useLanguage();
  return (
    <button type="button" onClick={() => setLocale(locale === "ur" ? "en" : "ur")}>
      switch locale
    </button>
  );
}

describe("layout direction", () => {
  beforeEach(() => {
    // Each test gets a clean slate: no stored locale, and no leftover
    // dir="rtl" on the shared document from a previous test's render.
    window.localStorage.clear();
    document.documentElement.dir = "ltr";
  });

  it("sets dir to rtl when the stored locale is Urdu", () => {
    window.localStorage.setItem("locale", "ur");
    renderProbe("footer.text");

    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ur");
  });

  it("keeps dir ltr for English", () => {
    renderProbe("footer.text");

    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
  });

  it("flips dir when the locale switches, and back again", () => {
    render(
      <LanguageProvider>
        <LocaleSwitcherProbe />
      </LanguageProvider>,
    );

    expect(document.documentElement.dir).toBe("ltr");

    fireEvent.click(screen.getByRole("button", { name: "switch locale" }));
    expect(document.documentElement.dir).toBe("rtl");

    fireEvent.click(screen.getByRole("button", { name: "switch locale" }));
    expect(document.documentElement.dir).toBe("ltr");
  });
});
