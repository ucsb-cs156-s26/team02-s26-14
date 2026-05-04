const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "cgaucho@ucsb.edu",
    teamId: "s22-5pm-3",
    tableOrBreakoutRoom: "7",
    requestTime: "2022-04-20T17:35:00",
    explanation: "Need help with Swagger",
    solved: false,
  },
  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "ldelplaya@ucsb.edu",
      teamId: "s22-6pm-3",
      tableOrBreakoutRoom: "11",
      requestTime: "2022-04-20T18:31:00",
      explanation: "Heroku deployment issues",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "phtcon@ucsb.edu",
      teamId: "s22-4pm-1",
      tableOrBreakoutRoom: "13",
      requestTime: "2022-04-20T18:35:00",
      explanation: "Merge conflict in Team02",
      solved: false,
    },
    {
      id: 3,
      requesterEmail: "amogus@ucsb.edu",
      teamId: "s22-5pm-4",
      tableOrBreakoutRoom: "10",
      requestTime: "2022-04-20T18:37:00",
      explanation: "Tests not passing",
      solved: true,
    },
  ],
};

export { helpRequestFixtures };
