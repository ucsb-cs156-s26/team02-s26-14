import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("RecommendationRequestTable tests", () => {
  const queryClient = new QueryClient();

  test("Has the expected column headers and content for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            recommendationRequests={recommendationRequestFixtures.threeRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "Requester Email",
      "Professor Email",
      "Explanation",
      "Date Requested",
      "Date Needed",
      "Done",
    ];
    const expectedFields = [
      "id",
      "requesterEmail",
      "professorEmail",
      "explanation",
      "dateRequested",
      "dateNeeded",
      "done",
    ];
    const testId = "RecommendationRequestTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const cell = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(cell).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "3",
    );

    const editButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).not.toBeInTheDocument();

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).not.toBeInTheDocument();
  });

  test("Has the expected column headers and content for admin user", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            recommendationRequests={recommendationRequestFixtures.threeRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "Requester Email",
      "Professor Email",
      "Explanation",
      "Date Requested",
      "Date Needed",
      "Done",
    ];
    const expectedFields = [
      "id",
      "requesterEmail",
      "professorEmail",
      "explanation",
      "dateRequested",
      "dateNeeded",
      "done",
    ];
    const testId = "RecommendationRequestTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const cell = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(cell).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "3",
    );

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Edit button navigates to the edit page for admin user", async () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            recommendationRequests={recommendationRequestFixtures.threeRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });

    const editButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(
        "/recommendationrequests/edit/2",
      ),
    );
  });

  test("Delete button calls delete callback", async () => {
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/recommendationrequests")
      .reply(200, { message: "Request deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            recommendationRequests={recommendationRequestFixtures.threeRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });

    const deleteButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
  });
  test("renders correctly when currentUser is undefined", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            recommendationRequests={recommendationRequestFixtures.threeRequests}
            currentUser={undefined}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const testId = "RecommendationRequestTable";

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-id`),
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("handles undefined recommendationRequests safely", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            recommendationRequests={undefined}
            currentUser={currentUserFixtures.userOnly}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId("RecommendationRequestTable-header-id"),
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId("RecommendationRequestTable-cell-row-0-col-id"),
    ).not.toBeInTheDocument();
  });
});
