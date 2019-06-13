(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["tabs-tabs-module"],{

/***/ "./src/app/onboarding/onboarding.component.html":
/*!******************************************************!*\
  !*** ./src/app/onboarding/onboarding.component.html ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-slides pager=\"true\" [options]=\"options\" align-items-center *ngIf=\"ready && !onboarded\">\n  <ion-slide class=\"what\">\n    <ion-card>\n      <!-- <ion-icon class=\"header\" name=\"tv\"></ion-icon> -->\n      <img src=\"https://clicker-brand.s3.amazonaws.com/logo-tv.png\" class=\"logo\" />\n      <ion-card-header> <ion-card-title>What is Clicker?</ion-card-title> </ion-card-header>\n      <ion-card-content>\n        <span> Clicker puts you in charge of the remote at your favorite sports bar in just a few clicks.</span>\n      </ion-card-content>\n      <span class=\"swipe\"><ion-icon class=\"arrow\" name=\"arrow-back\"></ion-icon> Swipe</span>\n    </ion-card>\n  </ion-slide>\n  <ion-slide class=\"how\">\n    <ion-card>\n      <ion-icon class=\"header\" name=\"wifi\"></ion-icon>\n      <ion-card-header> <ion-card-title>How does it work?</ion-card-title> </ion-card-header>\n      <ion-card-content>\n        <ol text-left>\n          <li>Select your location</li>\n          <li>Use live channel guide to select your game</li>\n          <li>Choose the TV by its numbered label</li>\n        </ol>\n      </ion-card-content>\n      <span class=\"swipe\"><ion-icon class=\"arrow\" name=\"arrow-back\"></ion-icon> Swipe</span>\n    </ion-card>\n  </ion-slide>\n  <ion-slide class=\"do\">\n    <ion-card>\n      <ion-icon name=\"basketball\"></ion-icon>\n      <ion-card-header> <ion-card-title>Let's Do It.</ion-card-title> </ion-card-header>\n      <ion-card-content>\n        <span>\n          We put some tokens in your account<br />\n          to get you started!</span\n        >\n        <div margin-top><ion-button color=\"success\" (click)=\"onGetStarted()\" size=\"large\">Go</ion-button></div>\n      </ion-card-content>\n    </ion-card>\n  </ion-slide>\n</ion-slides>\n"

/***/ }),

/***/ "./src/app/onboarding/onboarding.component.scss":
/*!******************************************************!*\
  !*** ./src/app/onboarding/onboarding.component.scss ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "ion-slides {\n  height: 100vh;\n  align-items: center;\n  background: #7b7b7b; }\n  ion-slides ion-slide {\n    min-height: 300px; }\n  ion-slides ion-slide.what img.logo {\n      height: 45px;\n      margin: 0 auto; }\n  ion-slides ion-slide.what ion-icon.header {\n      color: var(--ion-color-primary); }\n  ion-slides ion-slide.how ion-icon.header {\n      color: var(--ion-color-secondary); }\n  ion-slides ion-slide.do ion-icon {\n      color: var(--ion-color-tertiary); }\n  ion-slides ion-slide ion-icon {\n      font-size: 64px; }\n  ion-slides ion-slide ion-card {\n      min-height: 250px;\n      padding: 20px 0;\n      background: white; }\n  ion-slides ion-slide .swipe {\n      position: absolute;\n      bottom: 10px;\n      left: 10px;\n      opacity: 0.5; }\n  ion-slides ion-slide .swipe .arrow {\n        font-size: 14px;\n        vertical-align: bottom; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90aW1naWJsaW4vQ29kZS9jbGlja2VyL21vYmlsZS9hcHAvc3JjL2FwcC9vbmJvYXJkaW5nL29uYm9hcmRpbmcuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxhQUFhO0VBQ2IsbUJBQW1CO0VBQ25CLG1CQUFtQixFQUFBO0VBSHJCO0lBS0ksaUJBQWlCLEVBQUE7RUFMckI7TUFRUSxZQUFZO01BQ1osY0FBYyxFQUFBO0VBVHRCO01BWVEsK0JBQStCLEVBQUE7RUFadkM7TUFpQlEsaUNBQWlDLEVBQUE7RUFqQnpDO01BNEJRLGdDQUFnQyxFQUFBO0VBNUJ4QztNQWdDTSxlQUFlLEVBQUE7RUFoQ3JCO01BbUNNLGlCQUFpQjtNQUNqQixlQUFlO01BQ2YsaUJBQWlCLEVBQUE7RUFyQ3ZCO01Bd0NNLGtCQUFrQjtNQUNsQixZQUFZO01BQ1osVUFBVTtNQUNWLFlBQVksRUFBQTtFQTNDbEI7UUE2Q1EsZUFBZTtRQUNmLHNCQUFzQixFQUFBIiwiZmlsZSI6InNyYy9hcHAvb25ib2FyZGluZy9vbmJvYXJkaW5nLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiaW9uLXNsaWRlcyB7XG4gIGhlaWdodDogMTAwdmg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGJhY2tncm91bmQ6ICM3YjdiN2I7XG4gIGlvbi1zbGlkZSB7XG4gICAgbWluLWhlaWdodDogMzAwcHg7XG4gICAgJi53aGF0IHtcbiAgICAgIGltZy5sb2dvIHtcbiAgICAgICAgaGVpZ2h0OiA0NXB4O1xuICAgICAgICBtYXJnaW46IDAgYXV0bztcbiAgICAgIH1cbiAgICAgIGlvbi1pY29uLmhlYWRlciB7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1pb24tY29sb3ItcHJpbWFyeSk7XG4gICAgICB9XG4gICAgfVxuICAgICYuaG93IHtcbiAgICAgIGlvbi1pY29uLmhlYWRlciB7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1pb24tY29sb3Itc2Vjb25kYXJ5KTtcbiAgICAgIH1cbiAgICAgIC8vIG9sIHtcbiAgICAgIC8vICAgcGFkZGluZy1sZWZ0OiAyMHB4O1xuICAgICAgLy8gICBsaSB7XG4gICAgICAvLyAgICAgbWFyZ2luLWJvdHRvbTogOHB4O1xuICAgICAgLy8gICB9XG4gICAgICAvLyB9XG4gICAgfVxuICAgICYuZG8ge1xuICAgICAgaW9uLWljb24ge1xuICAgICAgICBjb2xvcjogdmFyKC0taW9uLWNvbG9yLXRlcnRpYXJ5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaW9uLWljb24ge1xuICAgICAgZm9udC1zaXplOiA2NHB4O1xuICAgIH1cbiAgICBpb24tY2FyZCB7XG4gICAgICBtaW4taGVpZ2h0OiAyNTBweDtcbiAgICAgIHBhZGRpbmc6IDIwcHggMDtcbiAgICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgIH1cbiAgICAuc3dpcGUge1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgYm90dG9tOiAxMHB4O1xuICAgICAgbGVmdDogMTBweDtcbiAgICAgIG9wYWNpdHk6IDAuNTtcbiAgICAgIC5hcnJvdyB7XG4gICAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgICAgdmVydGljYWwtYWxpZ246IGJvdHRvbTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ== */"

/***/ }),

/***/ "./src/app/onboarding/onboarding.component.ts":
/*!****************************************************!*\
  !*** ./src/app/onboarding/onboarding.component.ts ***!
  \****************************************************/
/*! exports provided: OnboardingComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OnboardingComponent", function() { return OnboardingComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _ionic_storage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ionic/storage */ "./node_modules/@ionic/storage/fesm5/ionic-storage.js");
/* harmony import */ var ngx_segment_analytics__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ngx-segment-analytics */ "./node_modules/ngx-segment-analytics/index.js");
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../globals */ "./src/app/globals.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var OnboardingComponent = /** @class */ (function () {
    function OnboardingComponent(storage, segment, globals) {
        this.storage = storage;
        this.segment = segment;
        this.globals = globals;
        this.options = {
            effect: 'flip',
        };
    }
    OnboardingComponent.prototype.ngOnInit = function () {
        this.checkOnboarded();
    };
    OnboardingComponent.prototype.checkOnboarded = function () {
        var _this = this;
        // TODO this might slow down the apparent opening of the app?
        this.storage.get('onboarded').then(function (onboarded) {
            _this.onboarded = onboarded;
            _this.ready = true;
        });
    };
    OnboardingComponent.prototype.onGetStarted = function () {
        this.storage.set('onboarded', true);
        this.onboarded = true;
        this.segment.track(this.globals.events.onboarding.completed);
    };
    OnboardingComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-onboarding',
            template: __webpack_require__(/*! ./onboarding.component.html */ "./src/app/onboarding/onboarding.component.html"),
            styles: [__webpack_require__(/*! ./onboarding.component.scss */ "./src/app/onboarding/onboarding.component.scss")]
        }),
        __metadata("design:paramtypes", [_ionic_storage__WEBPACK_IMPORTED_MODULE_1__["Storage"], ngx_segment_analytics__WEBPACK_IMPORTED_MODULE_2__["SegmentService"], _globals__WEBPACK_IMPORTED_MODULE_3__["Globals"]])
    ], OnboardingComponent);
    return OnboardingComponent;
}());



/***/ }),

/***/ "./src/app/onboarding/onboarding.module.ts":
/*!*************************************************!*\
  !*** ./src/app/onboarding/onboarding.module.ts ***!
  \*************************************************/
/*! exports provided: OnboardingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OnboardingModule", function() { return OnboardingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _onboarding_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./onboarding.component */ "./src/app/onboarding/onboarding.component.ts");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var OnboardingModule = /** @class */ (function () {
    function OnboardingModule() {
    }
    OnboardingModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            declarations: [_onboarding_component__WEBPACK_IMPORTED_MODULE_2__["OnboardingComponent"]],
            imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"], _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"], _ionic_angular__WEBPACK_IMPORTED_MODULE_4__["IonicModule"], _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]],
            exports: [_onboarding_component__WEBPACK_IMPORTED_MODULE_2__["OnboardingComponent"]],
        })
    ], OnboardingModule);
    return OnboardingModule;
}());



/***/ }),

/***/ "./src/app/tabs/tabs.module.ts":
/*!*************************************!*\
  !*** ./src/app/tabs/tabs.module.ts ***!
  \*************************************/
/*! exports provided: TabsPageModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TabsPageModule", function() { return TabsPageModule; });
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _tabs_router_module__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./tabs.router.module */ "./src/app/tabs/tabs.router.module.ts");
/* harmony import */ var _tabs_page__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./tabs.page */ "./src/app/tabs/tabs.page.ts");
/* harmony import */ var _onboarding_onboarding_module__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../onboarding/onboarding.module */ "./src/app/onboarding/onboarding.module.ts");
/* harmony import */ var _auth_auth_module__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../auth/auth.module */ "./src/app/auth/auth.module.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};








var TabsPageModule = /** @class */ (function () {
    function TabsPageModule() {
    }
    TabsPageModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [_ionic_angular__WEBPACK_IMPORTED_MODULE_0__["IonicModule"], _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"], _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"], _tabs_router_module__WEBPACK_IMPORTED_MODULE_4__["TabsPageRoutingModule"], _onboarding_onboarding_module__WEBPACK_IMPORTED_MODULE_6__["OnboardingModule"], _auth_auth_module__WEBPACK_IMPORTED_MODULE_7__["AuthModule"]],
            declarations: [_tabs_page__WEBPACK_IMPORTED_MODULE_5__["TabsPage"]],
        })
    ], TabsPageModule);
    return TabsPageModule;
}());



/***/ }),

/***/ "./src/app/tabs/tabs.page.html":
/*!*************************************!*\
  !*** ./src/app/tabs/tabs.page.html ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<app-onboarding></app-onboarding>\n<ion-tabs>\n  <ion-tab-bar slot=\"bottom\">\n    <ion-tab-button tab=\"reserve\">\n      <ion-icon name=\"tv\"></ion-icon>\n      <ion-label>Reserve</ion-label>\n    </ion-tab-button>\n\n    <ion-tab-button tab=\"profile\">\n      <ion-icon name=\"list-box\"></ion-icon>\n      <ion-label>Reservations</ion-label>\n    </ion-tab-button>\n  </ion-tab-bar>\n</ion-tabs>\n"

/***/ }),

/***/ "./src/app/tabs/tabs.page.scss":
/*!*************************************!*\
  !*** ./src/app/tabs/tabs.page.scss ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3RhYnMvdGFicy5wYWdlLnNjc3MifQ== */"

/***/ }),

/***/ "./src/app/tabs/tabs.page.ts":
/*!***********************************!*\
  !*** ./src/app/tabs/tabs.page.ts ***!
  \***********************************/
/*! exports provided: TabsPage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TabsPage", function() { return TabsPage; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var TabsPage = /** @class */ (function () {
    function TabsPage() {
    }
    TabsPage = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-tabs',
            template: __webpack_require__(/*! ./tabs.page.html */ "./src/app/tabs/tabs.page.html"),
            styles: [__webpack_require__(/*! ./tabs.page.scss */ "./src/app/tabs/tabs.page.scss")]
        })
    ], TabsPage);
    return TabsPage;
}());



/***/ }),

/***/ "./src/app/tabs/tabs.router.module.ts":
/*!********************************************!*\
  !*** ./src/app/tabs/tabs.router.module.ts ***!
  \********************************************/
/*! exports provided: TabsPageRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TabsPageRoutingModule", function() { return TabsPageRoutingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _tabs_page__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tabs.page */ "./src/app/tabs/tabs.page.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



var routes = [
    {
        path: 'tabs',
        component: _tabs_page__WEBPACK_IMPORTED_MODULE_2__["TabsPage"],
        children: [
            {
                path: 'profile',
                children: [
                    {
                        path: '',
                        loadChildren: '../profile/profile.module#ProfilePageModule',
                    },
                ],
            },
            {
                path: 'reserve',
                children: [
                    {
                        path: '',
                        loadChildren: '../reserve/reserve.module#ReservePageModule',
                    },
                ],
            },
            {
                path: '',
                redirectTo: 'reserve',
                pathMatch: 'full',
            },
        ],
    },
    {
        path: '',
        redirectTo: 'tabs/reserve/locations',
        pathMatch: 'full',
    },
];
var TabsPageRoutingModule = /** @class */ (function () {
    function TabsPageRoutingModule() {
    }
    TabsPageRoutingModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(routes)],
            exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]],
        })
    ], TabsPageRoutingModule);
    return TabsPageRoutingModule;
}());



/***/ })

}]);
//# sourceMappingURL=tabs-tabs-module.js.map