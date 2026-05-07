import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: "ACM",
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;

describe("UCSBOrganizationEditPage tests", () => {
  const queryClient = new QueryClient();

  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();

      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);

      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);

      axiosMock
        .onGet("/api/ucsborganization", { params: { orgCode: "ACM" } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText("Edit UCSB Organization");

      expect(
        screen.queryByTestId("UCSBOrganizationForm-orgCode"),
      ).not.toBeInTheDocument();

      await waitFor(() => {
        expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
      });

      expect(
        axiosMock.history.get.some(
          (request) =>
            request.url === "/api/ucsborganization" &&
            request.params.orgCode === "ACM",
        ),
      ).toBe(true);

      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();

      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);

      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);

      axiosMock
        .onGet("/api/ucsborganization", { params: { orgCode: "ACM" } })
        .reply(200, {
          orgCode: "ACM",
          orgTranslationShort: "ACM",
          orgTranslation: "Association for Computing Machinery",
          inactive: false,
        });

      axiosMock.onPut("/api/ucsborganization").reply(200, {
        orgCode: "ACM",
        orgTranslationShort: "ACM",
        orgTranslation: "Updated Association for Computing Machinery",
        inactive: false,
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      expect(
        axiosMock.history.get.some(
          (request) =>
            request.url === "/api/ucsborganization" &&
            request.params.orgCode === "ACM",
        ),
      ).toBe(true);

      const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
      const orgTranslationShortField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslationShort",
      );
      const orgTranslationField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslation",
      );
      const inactiveField = screen.getByTestId(
        "UCSBOrganizationForm-inactive",
      );
      const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

      expect(orgCodeField).toBeInTheDocument();
      expect(orgCodeField).toHaveValue("ACM");

      expect(orgTranslationShortField).toBeInTheDocument();
      expect(orgTranslationShortField).toHaveValue("ACM");

      expect(orgTranslationField).toBeInTheDocument();
      expect(orgTranslationField).toHaveValue(
        "Association for Computing Machinery",
      );

      expect(inactiveField).toBeInTheDocument();
      expect(inactiveField).not.toBeChecked();

      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent("Update");
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const orgTranslationField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslation",
      );
      const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

      expect(orgTranslationField).toHaveValue(
        "Association for Computing Machinery",
      );
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(orgTranslationField, {
        target: { value: "Updated Association for Computing Machinery" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());

      expect(mockToast).toBeCalledWith(
        "UCSB Organization Updated - orgCode: ACM",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });

      expect(axiosMock.history.put.length).toBe(1);

      expect(axiosMock.history.put[0].url).toBe("/api/ucsborganization");

      expect(axiosMock.history.put[0].params).toEqual({
        orgCode: "ACM",
      });

      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          orgCode: "ACM",
          orgTranslationShort: "ACM",
          orgTranslation: "Updated Association for Computing Machinery",
          inactive: false,
        }),
      );
    });
  });
});