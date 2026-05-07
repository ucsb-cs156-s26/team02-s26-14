import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import ArticleEditPage from "main/pages/Articles/ArticlesEditPage";
import { articleFixtures } from "fixtures/articleFixtures";

export default {
  title: "pages/Articles/ArticlesEditPage",
  component: ArticleEditPage,
};

const Template = () => <ArticleEditPage storybook={true} />;

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
    http.get("/api/articles", () => {
      return HttpResponse.json(articleFixtures.threeArticles[0], {
        status: 200,
      });
    }),

    http.put("/api/articles", () => {
      return HttpResponse.json(
        {
          id: "17",
          title: "Updated Article",
          url: "https://updated-example.com",
          explanation: "This is an updated test article",
          email: "updated@example.com",
          dateAdded: "2023-01-01T10:00",
        },
        { status: 200 },
      );
    }),
  ],
};
