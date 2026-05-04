import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";

export default {
  title: "pages/HelpRequest/HelpRequestCreatePage",
  component: HelpRequestCreatePage,
};

const Template = () => <HelpRequestCreatePage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.post("/api/helprequests/post", () => {
      return HttpResponse.json(
        {
          id: 17,
          requesterEmail: "cgaucho@ucsb.edu",
          teamId: "s22-5pm-3",
          tableOrBreakoutRoom: "7",
          explanation: "Need help with Swagger",
          requestTime: "2022-02-02T00:00",
          solved: true,
        },
        { status: 200 },
      );
    }),
  ],
};
