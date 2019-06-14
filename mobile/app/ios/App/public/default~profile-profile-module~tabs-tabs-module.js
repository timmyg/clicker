(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["default~profile-profile-module~tabs-tabs-module"],{

/***/ "./src/app/auth/auth.module.ts":
/*!*************************************!*\
  !*** ./src/app/auth/auth.module.ts ***!
  \*************************************/
/*! exports provided: AuthModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthModule", function() { return AuthModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _login_login_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./login/login.component */ "./src/app/auth/login/login.component.ts");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var AuthModule = /** @class */ (function () {
    function AuthModule() {
    }
    AuthModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            declarations: [_login_login_component__WEBPACK_IMPORTED_MODULE_2__["LoginComponent"]],
            imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"], _ionic_angular__WEBPACK_IMPORTED_MODULE_3__["IonicModule"], _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormsModule"]],
            exports: [_login_login_component__WEBPACK_IMPORTED_MODULE_2__["LoginComponent"]],
        })
    ], AuthModule);
    return AuthModule;
}());



/***/ }),

/***/ "./src/app/auth/login/login.component.html":
/*!*************************************************!*\
  !*** ./src/app/auth/login/login.component.html ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-header>\n  <ion-toolbar>\n    <ion-title> Login </ion-title>\n    <ion-buttons slot=\"end\">\n      <ion-button (click)=\"onCloseClick()\"> <ion-icon slot=\"icon-only\" name=\"close\"></ion-icon> </ion-button>\n    </ion-buttons>\n  </ion-toolbar>\n</ion-header>\n<ion-content padding>\n  <form #phoneForm=\"ngForm\" (ngSubmit)=\"onPhoneSubmit(phoneForm.form)\" *ngIf=\"!codeSent\">\n    <p class=\"ion-text-center\">Input your phone number below to login.</p>\n    <section>\n      <ion-input\n        placeholder=\"Phone Number\"\n        type=\"tel\"\n        maxlength=\"10\"\n        [(ngModel)]=\"phone\"\n        name=\"phone\"\n        [disabled]=\"waiting\"\n      ></ion-input>\n      <ion-button expand=\"block\" type=\"submit\" margin-top [disabled]=\"!phone || phone.length !== 10 || waiting\"\n        >Next</ion-button\n      >\n      <p class=\"ion-text-center\"><em> Your number is only used for authentication and is never shared.</em></p>\n    </section>\n  </form>\n  <form #codeForm=\"ngForm\" (ngSubmit)=\"onCodeSubmit()\" *ngIf=\"codeSent\">\n    <p class=\"ion-text-center\">\n      We have sent you an access code via text message for verification. Please enter it below.\n    </p>\n    <section>\n      <ion-input\n        placeholder=\"Code\"\n        type=\"tel\"\n        maxlength=\"8\"\n        [(ngModel)]=\"code\"\n        name=\"code\"\n        [disabled]=\"waiting\"\n      ></ion-input>\n      <ion-button expand=\"block\" type=\"submit\" margin-top [disabled]=\"!isEligibleCode() || waiting\">Login</ion-button>\n    </section>\n  </form>\n</ion-content>\n"

/***/ }),

/***/ "./src/app/auth/login/login.component.scss":
/*!*************************************************!*\
  !*** ./src/app/auth/login/login.component.scss ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "ion-input {\n  font-size: 40px;\n  text-align: center; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90aW1naWJsaW4vQ29kZS9jbGlja2VyL21vYmlsZS9hcHAvc3JjL2FwcC9hdXRoL2xvZ2luL2xvZ2luLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsZUFBZTtFQUNmLGtCQUFrQixFQUFBIiwiZmlsZSI6InNyYy9hcHAvYXV0aC9sb2dpbi9sb2dpbi5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbImlvbi1pbnB1dCB7XG4gIGZvbnQtc2l6ZTogNDBweDtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xufVxuIl19 */"

/***/ }),

/***/ "./src/app/auth/login/login.component.ts":
/*!***********************************************!*\
  !*** ./src/app/auth/login/login.component.ts ***!
  \***********************************************/
/*! exports provided: LoginComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginComponent", function() { return LoginComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
/* harmony import */ var auth0_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! auth0-js */ "./node_modules/auth0-js/dist/auth0.min.esm.js");
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var ngx_segment_analytics__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ngx-segment-analytics */ "./node_modules/ngx-segment-analytics/index.js");
/* harmony import */ var src_app_globals__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/app/globals */ "./src/app/globals.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};






var auth = new auth0_js__WEBPACK_IMPORTED_MODULE_2__["default"].WebAuth({
    domain: src_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].auth0.domain,
    clientID: src_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].auth0.clientId,
    // redirectUri: `${window.location.origin}/tabs/profile/logging-in`,
    redirectUri: src_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].packageId + "://" + src_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].auth0.domain + "/cordova/" + src_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].packageId + "/tabs/profile/logging-in",
    responseType: 'token id_token',
});
var LoginComponent = /** @class */ (function () {
    function LoginComponent(modalController, toastController, segment, globals) {
        this.modalController = modalController;
        this.toastController = toastController;
        this.segment = segment;
        this.globals = globals;
    }
    LoginComponent.prototype.onCloseClick = function () {
        this.modalController.dismiss();
    };
    LoginComponent.prototype.onPhoneSubmit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.waiting = true;
                auth.passwordlessStart({
                    connection: 'sms',
                    send: 'code',
                    phoneNumber: "+1" + this.phone,
                }, function (err, res) { return __awaiter(_this, void 0, void 0, function () {
                    var toastInvalid;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!err) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.toastController.create({
                                        message: err.description,
                                        color: 'danger',
                                        duration: 4000,
                                        cssClass: 'ion-text-center',
                                    })];
                            case 1:
                                toastInvalid = _a.sent();
                                toastInvalid.present();
                                this.waiting = false;
                                return [2 /*return*/, console.error(err, JSON.stringify(window))];
                            case 2:
                                this.segment.track(this.globals.events.login.started);
                                this.codeSent = true;
                                this.waiting = false;
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    LoginComponent.prototype.onCodeSubmit = function () {
        var _this = this;
        this.waiting = true;
        auth.passwordlessLogin({
            connection: 'sms',
            phoneNumber: ("+1" + this.phone).trim(),
            verificationCode: this.code.toString(),
        }, function (err, res) { return __awaiter(_this, void 0, void 0, function () {
            var toastInvalid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!err) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.toastController.create({
                                message: err.code === 'access_denied' ? 'Invalid code' : err.description,
                                color: 'danger',
                                duration: 4000,
                                cssClass: 'ion-text-center',
                            })];
                    case 1:
                        toastInvalid = _a.sent();
                        toastInvalid.present();
                        this.waiting = false;
                        return [2 /*return*/, console.error(err, JSON.stringify(window))];
                    case 2:
                        this.waiting = false;
                        return [2 /*return*/];
                }
            });
        }); });
    };
    LoginComponent.prototype.isEligibleCode = function () {
        return this.code && this.code.toString().length >= 4;
    };
    LoginComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-login',
            template: __webpack_require__(/*! ./login.component.html */ "./src/app/auth/login/login.component.html"),
            styles: [__webpack_require__(/*! ./login.component.scss */ "./src/app/auth/login/login.component.scss")]
        }),
        __metadata("design:paramtypes", [_ionic_angular__WEBPACK_IMPORTED_MODULE_1__["ModalController"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_1__["ToastController"],
            ngx_segment_analytics__WEBPACK_IMPORTED_MODULE_4__["SegmentService"],
            src_app_globals__WEBPACK_IMPORTED_MODULE_5__["Globals"]])
    ], LoginComponent);
    return LoginComponent;
}());



/***/ })

}]);
//# sourceMappingURL=default~profile-profile-module~tabs-tabs-module.js.map