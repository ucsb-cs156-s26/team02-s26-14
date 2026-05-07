import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

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
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("MenuItemReviewEditPage tests", () => {
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
      axiosMock.onGet("/api/menuitemreview", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText("Edit Menu Item Review");
      expect(
        screen.queryByTestId("MenuItemReviewForm-itemId"),
      ).not.toBeInTheDocument();
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
        .onGet("/api/menuitemreview", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          itemId: 67,
          reviewerEmail: "bigchungus@ucsb.edu",
          stars: 5,
          comments: "I loved the beans, so tasty!",
          dateReviewed: "2026-05-05T12:19",
        });
      axiosMock.onPut("/api/menuitemreview").reply(200, {
        id: "17",
        itemId: 68,
        reviewerEmail: "lilchungus@ucsb.edu",
        stars: 3,
        comments: "It was alright, nothing special",
        dateReviewed: "2026-05-05T12:18",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      const idField = screen.getByTestId("MenuItemReviewForm-id");
      const itemIdField = screen.getByTestId("MenuItemReviewForm-itemId");
      const reviewerEmailField = screen.getByTestId(
        "MenuItemReviewForm-reviewerEmail",
      );
      const starsField = screen.getByTestId("MenuItemReviewForm-stars");
      const commentsField = screen.getByTestId("MenuItemReviewForm-comments");
      const dateReviewedField = screen.getByTestId(
        "MenuItemReviewForm-dateReviewed",
      );
      const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(itemIdField).toBeInTheDocument();
      expect(itemIdField).toHaveValue("67");
      expect(reviewerEmailField).toBeInTheDocument();
      expect(reviewerEmailField).toHaveValue("bigchungus@ucsb.edu");
      expect(starsField).toBeInTheDocument();
      expect(starsField).toHaveValue("5");
      expect(commentsField).toBeInTheDocument();
      expect(commentsField).toHaveValue("I loved the beans, so tasty!");
      expect(dateReviewedField).toBeInTheDocument();
      expect(dateReviewedField).toHaveValue("2026-05-05T12:19");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(itemIdField, { target: { value: "68" } });
      fireEvent.change(reviewerEmailField, {
        target: { value: "lilchungus@ucsb.edu" },
      });
      fireEvent.change(starsField, { target: { value: "3" } });
      fireEvent.change(commentsField, {
        target: { value: "It was alright, nothing special" },
      });
      fireEvent.change(dateReviewedField, {
        target: { value: "2026-05-05T12:18" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith("Menu Item Review Updated - id: 17");

      expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          itemId: "68",
          reviewerEmail: "lilchungus@ucsb.edu",
          stars: "3",
          dateReviewed: "2026-05-05T12:18",
          comments: "It was alright, nothing special",
        }),
      );
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      const idField = screen.getByTestId("MenuItemReviewForm-id");
      const itemIdField = screen.getByTestId("MenuItemReviewForm-itemId");
      const reviewerEmailField = screen.getByTestId(
        "MenuItemReviewForm-reviewerEmail",
      );
      const starsField = screen.getByTestId("MenuItemReviewForm-stars");
      const commentsField = screen.getByTestId("MenuItemReviewForm-comments");
      const dateReviewedField = screen.getByTestId(
        "MenuItemReviewForm-dateReviewed",
      );
      const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

      expect(idField).toHaveValue("17");
      expect(itemIdField).toHaveValue("67");
      expect(reviewerEmailField).toHaveValue("bigchungus@ucsb.edu");
      expect(starsField).toHaveValue("5");
      expect(commentsField).toHaveValue("I loved the beans, so tasty!");
      expect(dateReviewedField).toHaveValue("2026-05-05T12:19");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(itemIdField, { target: { value: "68" } });
      fireEvent.change(reviewerEmailField, {
        target: { value: "lilchungus@ucsb.edu" },
      });
      fireEvent.change(starsField, { target: { value: "3" } });
      fireEvent.change(commentsField, {
        target: { value: "It was alright, nothing special" },
      });
      fireEvent.change(dateReviewedField, {
        target: { value: "2026-05-05T12:18" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith("Menu Item Review Updated - id: 17");
      expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });
    });
  });
});
