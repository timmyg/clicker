import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WalletPage } from "./wallet.page";

describe("WalletPage", () => {
  let component: WalletPage;
  let fixture: ComponentFixture<WalletPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WalletPage]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
