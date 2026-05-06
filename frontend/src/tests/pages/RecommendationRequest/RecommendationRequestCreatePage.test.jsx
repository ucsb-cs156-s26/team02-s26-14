import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

const axiosMock = new AxiosMockAdapter(axios);
describe("RecommendationRequestCreatePage tests", () => {
  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const recommendationRequest = {
      id: 2,
      requesterEmail: "abhijeet@ucsb.edu",
      professorEmail: "abhijeet@ucsb.edu",
      explanation: "hi",
      dateRequested: "2026-05-03T20:20",
      dateNeeded: "2026-05-03T20:20",
      done: false,
    };

    axiosMock
      .onPost("/api/recommendationrequests/post")
      .reply(202, recommendationRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    const requesterEmailInput = screen.getByLabelText("Requester Email");
    expect(requesterEmailInput).toBeInTheDocument();

    const professorEmailInput = screen.getByLabelText("Professor Email");
    expect(professorEmailInput).toBeInTheDocument();

    const explanationInput = screen.getByLabelText("Explanation");
    expect(explanationInput).toBeInTheDocument();

    const dateRequestedInput = screen.getByLabelText(
      "Date Requested (iso format)",
    );
    expect(dateRequestedInput).toBeInTheDocument();

    const dateNeededInput = screen.getByLabelText("Date Needed (iso format)");
    expect(dateNeededInput).toBeInTheDocument();

    const doneInput = screen.getByLabelText("Done");
    expect(doneInput).toBeInTheDocument();

    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");
    expect(submitButton).toBeInTheDocument();

    fireEvent.change(requesterEmailInput, {
      target: { value: "abhijeet@ucsb.edu" },
    });
    fireEvent.change(professorEmailInput, {
      target: { value: "abhijeet@ucsb.edu" },
    });
    fireEvent.change(explanationInput, {
      target: { value: "hi" },
    });
    fireEvent.change(dateRequestedInput, {
      target: { value: "2026-05-03T20:20" },
    });
    fireEvent.change(dateNeededInput, {
      target: { value: "2026-05-03T20:21" },
    });

    // console.log("ALARMs");
    // console.log(axiosMock.history.post);

    fireEvent.click(submitButton);

    //console.log(axiosMock.history.post);

    //screen.debug(null, Infinity)

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "abhijeet@ucsb.edu",
      professorEmail: "abhijeet@ucsb.edu",
      explanation: "hi",
      dateRequested: "2026-05-03T20:20",
      dateNeeded: "2026-05-03T20:21",
      done: false,
    });

    expect(mockToast).toHaveBeenCalledWith(
      "New Recommendation Request Created - id: 2",
    );
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/recommendationrequests",
    });
  });
});
