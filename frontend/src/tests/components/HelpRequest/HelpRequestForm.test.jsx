import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
    const originalModule = await vi.importActual("react-router");
    return {
        ...originalModule,
        useNavigate: () => mockedNavigate,
    };
});

describe("HelpRequestForm tests", () => {
    test("renders correctly", async () => {
        render(
            <Router>
                <HelpRequestForm />
            </Router>,
        );
        await screen.findByText(/Requester Email/);
        await screen.findByText(/Create/);
        expect(screen.getByText(/Requester Email/)).toBeInTheDocument();
    });

    test("renders correctly when passing in a HelpRequest", async () => {
        render(
            <Router>
                <HelpRequestForm initialContents={helpRequestFixtures.oneHelpRequest} />
            </Router>,
        );
        await screen.findByTestId(/HelpRequestForm-id/);
        expect(screen.getByText(/Id/)).toBeInTheDocument();
        expect(screen.getByTestId(/HelpRequestForm-id/)).toHaveValue("1");
    });

    test("Correct Error messsages on bad input", async () => {
        render(
            <Router>
                <HelpRequestForm />
            </Router>,
        );
        await screen.findByTestId("HelpRequestForm-requesterEmail");
        const emailField = screen.getByTestId("HelpRequestForm-requesterEmail");
        const submitButton = screen.getByTestId("HelpRequestForm-submit");

        fireEvent.change(emailField, { target: { value: "bad-input" } });
        fireEvent.click(submitButton);

        await screen.findByText(/Requester Email must be a valid email./);
        expect(screen.getByText(/Requester Email must be a valid email./)).toBeInTheDocument();
    });

    test("Correct Error messsages on missing input", async () => {
        render(
            <Router>
                <HelpRequestForm />
            </Router>,
        );
        await screen.findByTestId("HelpRequestForm-submit");
        const submitButton = screen.getByTestId("HelpRequestForm-submit");

        fireEvent.click(submitButton);

        await screen.findByText(/Requester Email is required./);
        expect(screen.getByText(/Team ID is required./)).toBeInTheDocument();
        expect(screen.getByText(/Table or Breakout Room is required./)).toBeInTheDocument();
        expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
        expect(screen.getByText(/Request Time is required./)).toBeInTheDocument();
    });

    test("No Error messsages on good input", async () => {
        const mockSubmitAction = vi.fn();

        render(
            <Router>
                <HelpRequestForm submitAction={mockSubmitAction} />
            </Router>,
        );
        await screen.findByTestId("HelpRequestForm-requesterEmail");

        const emailField = screen.getByTestId("HelpRequestForm-requesterEmail");
        const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
        const tableOrBreakoutRoomField = screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom");
        const explanationField = screen.getByTestId("HelpRequestForm-explanation");
        const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
        const submitButton = screen.getByTestId("HelpRequestForm-submit");

        fireEvent.change(emailField, { target: { value: "cgaucho@ucsb.edu" } });
        fireEvent.change(teamIdField, { target: { value: "s22-5pm-3" } });
        fireEvent.change(tableOrBreakoutRoomField, { target: { value: "7" } });
        fireEvent.change(explanationField, { target: { value: "Need help" } });
        fireEvent.change(requestTimeField, { target: { value: "2022-01-02T12:00" } });
        fireEvent.click(submitButton);

        await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

        expect(screen.queryByText(/Requester Email must be a valid email./)).not.toBeInTheDocument();
        expect(screen.queryByText(/Requester Email is required./)).not.toBeInTheDocument();
    });

    test("that navigate(-1) is called when Cancel is clicked", async () => {
        render(
            <Router>
                <HelpRequestForm />
            </Router>,
        );
        await screen.findByTestId("HelpRequestForm-cancel");
        const cancelButton = screen.getByTestId("HelpRequestForm-cancel");

        fireEvent.click(cancelButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
    });
});