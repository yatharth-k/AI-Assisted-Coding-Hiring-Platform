export const problems = [
  {
    id: 1,
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.`,
    publicTestCases: [
      { input: "2 7 11 15\n9", expected: "0 1" },
      { input: "3 2 4\n6", expected: "1 2" },
      { input: "3 3\n6", expected: "0 1" }
    ],
    privateTestCases: [
      { input: "1 2 3 4 5 6 7 8 9 10\n19", expected: "8 9" },
      { input: "5 5 5 5 5 5 5 5 5 5\n10", expected: "0 1" },
      { input: "100 200 300 400 500\n700", expected: "1 3" }
    ]
  }
]; 