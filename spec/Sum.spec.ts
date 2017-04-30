import sum from "./sum";

describe("sum method", function() {
   it("should add the two numbers together", function() {
       expect(sum(2, 5)).toBe(7);
    });
});