import { TestBed } from "@angular/core/testing";

import { ProgramService } from "./Program.service";

describe("ProgramService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: ProgramService = TestBed.get(ProgramService);
    expect(service).toBeTruthy();
  });
});
