import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import Footer from "./Footer";

beforeEach(() => {
  window.localStorage.clear();
});

function renderWithProvider() {
  return render(
    <LanguageProvider>
      <LanguageSwitcher />
      <Footer />
    </LanguageProvider>,
  );
}

describe("LanguageSwitcher", () => {
  it("defaults to English", () => {
    renderWithProvider();
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("en");
    expect(document.documentElement.lang).toBe("en");
  });

  it("switches the active language and translated text", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    await user.selectOptions(select, "ur");

    expect(select.value).toBe("ur");
    expect(document.documentElement.lang).toBe("ur");
    // `dir` intentionally stays "ltr" so switching languages never shifts
    // the layout - only the text content changes.
    expect(document.documentElement.dir).toBe("ltr");
    // footer translation
    expect(screen.queryByText(/open for contributions/i)).toBeNull();
    expect(screen.getByText(/تعاون کے لیے کھلا ہے/)).not.toBeNull();
  });

  it("persists the selected language to localStorage", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    await user.selectOptions(select, "ur");

    expect(window.localStorage.getItem("locale")).toBe("ur");
  });

  it("restores a previously selected language on mount", () => {
    window.localStorage.setItem("locale", "ur");
    renderWithProvider();

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("ur");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("falls back to English when used without a provider", () => {
    render(<LanguageSwitcher />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("en");
  });

  it("auto-detects Urdu from navigator.languages on first visit", () => {
    const originalLanguages = window.navigator.languages;
    Object.defineProperty(window.navigator, "languages", {
      value: ["ur-PK", "ur"],
      configurable: true,
    });

    try {
      renderWithProvider();
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("ur");
      expect(document.documentElement.lang).toBe("ur");
    } finally {
      Object.defineProperty(window.navigator, "languages", {
        value: originalLanguages,
        configurable: true,
      });
    }
  });

  it("prioritizes stored preference over browser language", () => {
    window.localStorage.setItem("locale", "en");
    const originalLanguages = window.navigator.languages;
    Object.defineProperty(window.navigator, "languages", {
      value: ["ur-PK", "ur"],
      configurable: true,
    });

    try {
      renderWithProvider();
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("en");
      expect(document.documentElement.lang).toBe("en");
    } finally {
      Object.defineProperty(window.navigator, "languages", {
        value: originalLanguages,
        configurable: true,
      });
    }
  });
});
