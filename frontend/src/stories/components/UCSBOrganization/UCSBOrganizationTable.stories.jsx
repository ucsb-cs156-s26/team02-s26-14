import React from "react";
import UCSBOrganizationTable from "main/components/UCSBOrganization/UCSBOrganizationTable";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/UCSBOrganization/UCSBOrganizationTable",
  component: UCSBOrganizationTable,
};

const Template = (args) => {
  return <UCSBOrganizationTable {...args} />;
};

const mockOrganizations = [
  {
    id: 1,
    orgCode: "ACM",
    orgTranslationShort: "ACM",
    orgTranslation: "Association for Computing Machinery",
    inactive: false,
  },
  {
    id: 2,
    orgCode: "IEEE",
    orgTranslationShort: "IEEE",
    orgTranslation: "Institute of Electrical and Electronics Engineers",
    inactive: false,
  },
  {
    id: 3,
    orgCode: "DSC",
    orgTranslationShort: "Data Science Club",
    orgTranslation: "Data Science Club",
    inactive: true,
  },
];

export const Empty = Template.bind({});

Empty.args = {
  organizations: [],
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  organizations: mockOrganizations,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  organizations: mockOrganizations,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/ucsborganizations", () => {
      return HttpResponse.json(
        { message: "Organization deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
