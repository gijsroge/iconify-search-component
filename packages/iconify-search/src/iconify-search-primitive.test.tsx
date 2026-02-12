import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IconifySearchPrimitive } from "./iconify-search-primitive.js";

// Mock hooks to avoid network and debounce in tests
vi.mock("./use-iconify-search.js", () => ({
  useIconifySearchAll: () => ({
    data: {
      icons: ["mdi:home", "mdi:search"],
      total: 2,
      limit: 64,
      start: 0,
      collections: { mdi: { name: "Material Design Icons" } },
      request: {},
    },
    isLoading: false,
    isFetching: false,
  }),
}));

vi.mock("@tanstack/react-pacer", () => ({
  useDebouncedValue: (value: string) => [
    value,
    { state: { isPending: false } },
    {},
  ],
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("IconifySearchPrimitive", () => {
  it("renders children with search state", () => {
    let state: { query: string; getIconUrl: (id: string) => string } | null =
      null;
    renderWithProviders(
      <IconifySearchPrimitive>
        {(s) => {
          state = s;
          return <div data-testid="child">query: {s.query}</div>;
        }}
      </IconifySearchPrimitive>
    );
    expect(screen.getByTestId("child").textContent).toBe("query: ");
    expect(state).not.toBeNull();
    expect(state!.query).toBe("");
    expect(state!.getIconUrl("mdi:home")).toBe(
      "https://api.iconify.design/mdi/home.svg?height=24"
    );
  });

  it("single selection: setQuery updates query, selectIcon sets one icon", async () => {
    const user = userEvent.setup();
    let state: {
      query: string;
      setQuery: (q: string) => void;
      selectedIcons: string[];
      selectIcon: (id: string) => void;
    } | null = null;
    renderWithProviders(
      <IconifySearchPrimitive multiple={false}>
        {(s) => {
          state = s;
          return (
            <div>
              <input
                data-testid="input"
                value={s.query}
                onChange={(e) => s.setQuery(e.target.value)}
              />
              <span data-testid="selected">{s.selectedIcons.join(",")}</span>
              <button
                data-testid="select-home"
                onClick={() => s.selectIcon("mdi:home")}
              />
              <button
                data-testid="select-search"
                onClick={() => s.selectIcon("mdi:search")}
              />
            </div>
          );
        }}
      </IconifySearchPrimitive>
    );
    expect(state!.selectedIcons).toEqual([]);
    await user.click(screen.getByTestId("select-home"));
    expect(state!.selectedIcons).toEqual(["mdi:home"]);
    await user.click(screen.getByTestId("select-search"));
    expect(state!.selectedIcons).toEqual(["mdi:search"]);
    await user.type(screen.getByTestId("input"), "test");
    expect(state!.query).toBe("test");
  });

  it("multiple selection: selectIcon toggles icons", async () => {
    const user = userEvent.setup();
    let state: {
      selectedIcons: string[];
      selectIcon: (id: string) => void;
    } | null = null;
    renderWithProviders(
      <IconifySearchPrimitive multiple>
        {(s) => {
          state = s;
          return (
            <div>
              <span data-testid="selected">{s.selectedIcons.join(",")}</span>
              <button
                data-testid="select-home"
                onClick={() => s.selectIcon("mdi:home")}
              />
              <button
                data-testid="select-search"
                onClick={() => s.selectIcon("mdi:search")}
              />
            </div>
          );
        }}
      </IconifySearchPrimitive>
    );
    await user.click(screen.getByTestId("select-home"));
    expect(state!.selectedIcons).toEqual(["mdi:home"]);
    await user.click(screen.getByTestId("select-search"));
    expect(state!.selectedIcons).toEqual(["mdi:home", "mdi:search"]);
    await user.click(screen.getByTestId("select-home"));
    expect(state!.selectedIcons).toEqual(["mdi:search"]);
  });

  it("exposes groups from search data", () => {
    let state: {
      groups: Array<{ prefix: string; name: string; icons: string[] }>;
    } | null = null;
    renderWithProviders(
      <IconifySearchPrimitive>
        {(s) => {
          state = s;
          return <div data-testid="child" />;
        }}
      </IconifySearchPrimitive>
    );
    expect(state!.groups.length).toBeGreaterThanOrEqual(1);
    const mdiGroup = state!.groups.find((g) => g.prefix === "mdi");
    expect(mdiGroup).toBeDefined();
    expect(mdiGroup!.icons).toContain("mdi:home");
    expect(mdiGroup!.icons).toContain("mdi:search");
  });
});
